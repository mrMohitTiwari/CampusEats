import re
from uuid import UUID
from errors import APIError

STATUSES = {'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY',
            'DELIVERED', 'COMPLETED', 'CANCELLED'}


def bad(detail):
    raise APIError(400, 'Bad Request', detail)


def identifier(value):
    try:
        if not isinstance(value, str) or str(UUID(value)) != value:
            bad('Identifiers must be canonical UUID strings.')
    except (ValueError, AttributeError):
        bad('Identifiers must be canonical UUID strings.')
    return value


def string(value, maximum):
    return isinstance(value, str) and bool(value.strip()) and len(value) <= maximum


def validate(body, kind):
    if not isinstance(body, dict):
        bad('The body must be a JSON object.')
    if kind == 'cancellation':
        if set(body) != {'reason'} or not string(body['reason'], 200):
            bad('Supply only a nonblank reason of at most 200 characters.')
        return body
    fields = {'user_id', 'vendor_id', 'fulfillment_type', 'items', 'payment_token'}
    if set(body) != fields:
        bad('Required fields: ' + ', '.join(sorted(fields)) + '; no extra fields.')
    identifier(body['user_id'])
    identifier(body['vendor_id'])
    if body['fulfillment_type'] not in ('delivery', 'pickup'):
        bad('fulfillment_type must be delivery or pickup.')
    if not string(body['payment_token'], 256):
        bad('payment_token must be a nonblank string of at most 256 characters.')
    if not isinstance(body['items'], list) or not 1 <= len(body['items']) <= 100:
        bad('items must contain between 1 and 100 entries.')
    for item in body['items']:
        if not isinstance(item, dict) or set(item) != {'item_id', 'item_name_snapshot', 'quantity', 'unit_price_snapshot'}:
            bad('Each item requires item_id, item_name_snapshot, quantity, unit_price_snapshot.')
        identifier(item['item_id'])
        if not string(item['item_name_snapshot'], 120):
            bad('Invalid item_name_snapshot.')
        if type(item['quantity']) is not int or not 1 <= item['quantity'] <= 100:
            bad('quantity must be an integer between 1 and 100.')
        price = item['unit_price_snapshot']
        if not isinstance(price, str) or not re.fullmatch(r'\d{1,6}\.\d{2}', price, flags=re.ASCII):
            bad('unit_price_snapshot must be a decimal string such as 75.00.')
    return body
