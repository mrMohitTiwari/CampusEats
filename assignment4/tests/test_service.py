import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from copy import deepcopy
from unittest.mock import Mock
import pytest
import requests
from app import create_app
from payments import Payments
from errors import APIError


@pytest.fixture
def payload():
    return {'user_id': '11111111-1111-4111-8111-111111111111',
            'vendor_id': '22222222-2222-4222-8222-222222222222',
            'fulfillment_type': 'pickup', 'payment_token': 'demo-token',
            'items': [{'item_id': '33333333-3333-4333-8333-333333333333',
                       'item_name_snapshot': 'Veg thali', 'quantity': 2, 'unit_price_snapshot': '75.00'}]}


@pytest.fixture
def service():
    gateway = Mock()
    app = create_app(payments=gateway)
    return app.test_client(), gateway, app.extensions['orders_store']


def create(client, payload, key='test-key'):
    return client.post('/orders', json=payload, headers={'Idempotency-Key': key})


def test_create_code_location_and_private_fields(service, payload):
    client, gateway, store = service
    response = create(client, payload)
    assert response.status_code == 201
    assert response.headers['Location'] == '/orders/' + response.json['order_id']
    assert client.get(response.headers['Location']).json == response.json
    assert response.json['total_amount'] == '150.00'
    assert not {'internal_id', 'idempotency_key', 'payment_token', 'history'} & response.json.keys()
    gateway.authorize.assert_called_once()


def test_idempotent_repeat_original_even_after_cancellation(service, payload):
    client, gateway, store = service
    first = create(client, payload)
    client.post(first.headers['Location'] + '/cancellation', json={'reason': 'Changed plans'})
    second = create(client, payload)
    assert second.status_code == 201
    assert second.json == first.json
    assert second.headers['Location'] == first.headers['Location']
    assert len(store.orders) == 1
    gateway.authorize.assert_called_once()


def test_malformed_body(service):
    response = service[0].post('/orders', data='{', content_type='application/json')
    assert response.status_code == 400
    assert response.content_type == 'application/problem+json'
    assert set(response.json) == {'type', 'title', 'status', 'detail'}


def test_unknown_id(service):
    response = service[0].get('/orders/00000000-0000-4000-8000-000000000000')
    assert response.status_code == response.json['status'] == 404


def test_conflicts_and_filters(service, payload):
    client, gateway, store = service
    first = create(client, payload)
    changed = deepcopy(payload)
    changed['items'][0]['quantity'] = 3
    assert create(client, changed).status_code == 409
    uri = first.headers['Location'] + '/cancellation'
    assert client.get(uri).status_code == 404
    assert client.post(uri, json={'reason': 'Changed plans'}).status_code == 201
    assert client.get(uri).json['reason'] == 'Changed plans'
    assert client.post(uri, json={'reason': 'Again'}).status_code == 409
    assert client.get('/orders?status=PLACED').json == {'orders': []}
    assert len(client.get('/orders?status=CANCELLED&user_id=' + payload['user_id']).json['orders']) == 1


@pytest.mark.parametrize('value', [None, [], {}, {'items': []}])
def test_invalid_shapes(service, value):
    response = service[0].post('/orders', json=value, content_type='application/json')
    assert response.status_code == 400


def test_boolean_quantity_rejected(service, payload):
    payload['items'][0]['quantity'] = True
    assert create(service[0], payload).status_code == 400
    service[1].authorize.assert_not_called()


def test_domain_zero_total(service, payload):
    payload['items'][0]['unit_price_snapshot'] = '0.00'
    assert create(service[0], payload).status_code == 422


def reply(code, body=None):
    result = Mock(status_code=code)
    result.json.return_value = body or {'status': 'AUTHORIZED'}
    return result


def test_backoff_and_stable_key():
    post = Mock(side_effect=[requests.Timeout(), reply(503), reply(201)])
    sleep = Mock()
    Payments('http://payments.test', post, sleep, lambda a, b: 0.02).authorize({'order_id': 'one'}, 'same-key')
    assert [c.args[0] for c in sleep.call_args_list] == pytest.approx([0.12, 0.22])
    assert post.call_count == 3
    for call in post.call_args_list:
        assert call.kwargs['headers']['Idempotency-Key'] == 'same-key'
        assert call.kwargs['timeout'] == (1, 2)
        assert call.kwargs['allow_redirects'] is False


@pytest.mark.parametrize('status', [400, 401, 404, 408, 409, 422, 429])
def test_no_4xx_retry(status):
    post, sleep = Mock(return_value=reply(status)), Mock()
    with pytest.raises(APIError) as error:
        Payments('http://payments.test', post, sleep).authorize({}, 'same')
    assert error.value.status == (422 if status == 422 else 503)
    post.assert_called_once()
    sleep.assert_not_called()


def test_unavailable_then_recovery_keeps_order_id(service, payload):
    client, gateway, store = service
    gateway.authorize.side_effect = [APIError(503, 'Service Unavailable', 'PAYMENT_UNAVAILABLE'), None]
    assert create(client, payload).status_code == 503
    assert not store.orders
    assert create(client, payload).status_code == 201
    assert gateway.authorize.call_args_list[0] == gateway.authorize.call_args_list[1]


def test_exhausted_network_and_invalid_reply():
    for results in ([requests.ConnectionError()] * 3, [reply(201, {'status': 'UNKNOWN'})]):
        post = Mock(side_effect=results)
        with pytest.raises(APIError) as error:
            Payments('http://payments.test', post, Mock()).authorize({}, 'same')
        assert error.value.status == 503
        assert post.call_count == len(results)
