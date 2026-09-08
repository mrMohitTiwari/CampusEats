import hashlib
import json
import re
from copy import deepcopy
from decimal import Decimal
from uuid import uuid4
from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException
from errors import APIError, problem
from models import Order, now
from payments import Payments
from store import Store
from validation import STATUSES, bad, identifier, validate


def create_app(store=None, payments=None):
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 256 * 1024
    db, gateway = store or Store(), payments or Payments()
    app.extensions['orders_store'] = db

    @app.errorhandler(APIError)
    def api_error(error):
        return problem(error.status, error.title, error.detail)

    @app.errorhandler(HTTPException)
    def http_error(error):
        response = problem(error.code, error.name, error.description)
        if error.code == 405:
            response.headers['Allow'] = ', '.join(error.valid_methods)
        return response

    @app.errorhandler(Exception)
    def unexpected(error):
        app.logger.exception('Unhandled service error')
        return problem(500, 'Internal Server Error', 'An unexpected service error occurred.')

    def body(kind):
        if not request.is_json:
            raise APIError(415, 'Unsupported Media Type', 'Use application/json.')
        return validate(request.get_json(), kind)

    def lookup(order_id):
        identifier(order_id)
        if order_id not in db.orders:
            raise APIError(404, 'Not Found', 'Order does not exist.')
        return db.orders[order_id]

    @app.post('/orders')
    def create_order():
        data = body('order')
        key = request.headers.get('Idempotency-Key', '')
        if not re.fullmatch(r'[A-Za-z0-9._:-]{1,128}', key):
            bad('A valid Idempotency-Key header is required (1–128 characters).')
        digest = hashlib.sha256(json.dumps(data, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        total = sum(Decimal(i['unit_price_snapshot']) * i['quantity'] for i in data['items'])
        if total <= 0 or total > Decimal('999999.99'):
            raise APIError(422, 'Unprocessable Content', 'Order total must be between 0.01 and 999999.99.')
        # One lock covers reservation and outbound work: simple, serialized demo safety.
        with db.lock:
            attempt = db.attempts.get(key)
            if attempt and attempt['digest'] != digest:
                raise APIError(409, 'Conflict', 'Idempotency-Key was already used with a different body.')
            if not attempt:
                attempt = {'digest': digest, 'order_id': str(uuid4()), 'result': None}
                db.attempts[key] = attempt
            location = '/orders/' + attempt['order_id']
            if attempt['result'] is not None:
                return jsonify(deepcopy(attempt['result'])), 201, {'Location': location}
            gateway.authorize({'order_id': attempt['order_id'], 'user_id': data['user_id'],
                               'amount': str(total.quantize(Decimal('0.01'))),
                               'payment_token': data['payment_token']}, 'orders:' + key)
            order = Order(attempt['order_id'], data['user_id'], data['vendor_id'],
                          data['fulfillment_type'], deepcopy(data['items']),
                          str(total.quantize(Decimal('0.01'))), key)
            order.history.append({'status': 'PLACED', 'changed_at': order.created_at})
            db.orders[order.order_id] = order
            attempt['result'] = order.as_json()
            return jsonify(order.as_json()), 201, {'Location': location}

    @app.get('/orders')
    def list_orders():
        if set(request.args) - {'status', 'user_id'} or any(len(request.args.getlist(k)) != 1 for k in request.args):
            bad('Use only one status and/or user_id query parameter.')
        status, user = request.args.get('status'), request.args.get('user_id')
        if status is not None and status not in STATUSES:
            bad('Unknown status filter.')
        if user is not None:
            identifier(user)
        with db.lock:
            return jsonify(orders=[o.as_json() for o in db.orders.values()
                                   if (status is None or o.status == status) and (user is None or o.user_id == user)])

    @app.get('/orders/<order_id>')
    def get_order(order_id):
        with db.lock:
            return jsonify(lookup(order_id).as_json())

    @app.post('/orders/<order_id>/cancellation')
    def cancel_order(order_id):
        data = body('cancellation')
        with db.lock:
            order = lookup(order_id)
            if order.status != 'PLACED':
                raise APIError(409, 'Conflict', 'Only a PLACED order can be cancelled.')
            order.status = 'CANCELLED'
            order.cancellation = {'order_id': order_id, 'reason': data['reason'], 'cancelled_at': now()}
            order.history.append({'status': 'CANCELLED', 'changed_at': order.cancellation['cancelled_at']})
            return jsonify(order.cancellation), 201, {'Location': f'/orders/{order_id}/cancellation'}

    @app.get('/orders/<order_id>/cancellation')
    def get_cancellation(order_id):
        with db.lock:
            cancellation = lookup(order_id).cancellation
            if cancellation is None:
                raise APIError(404, 'Not Found', 'Cancellation does not exist.')
            return jsonify(cancellation)

    return app


if __name__ == '__main__':
    create_app().run(host='127.0.0.1', port=5000)
