"""Standalone Payments contract demo; never imports the Orders store.

DEMO_FAIL_FIRST=1 simulates a lost response AFTER authorization is recorded.
Tokens prefixed decline simulate a domain refusal. No real funds are moved.
"""
import os
from threading import Lock
from uuid import uuid4
from flask import Flask, jsonify, request

app = Flask(__name__)
records, failed, lock = {}, set(), Lock()


@app.post('/payments')
def payments():
    key = request.headers.get('Idempotency-Key')
    body = request.get_json()
    with lock:
        if not key:
            return jsonify(type='about:blank', title='Bad Request', status=400, detail='Key required'), 400
        if key in records:
            return jsonify(records[key]), 201
        if body.get('payment_token', '').startswith('decline'):
            return jsonify(type='about:blank', title='Unprocessable Content', status=422, detail='PAYMENT_DECLINED'), 422
        records[key] = {'payment_id': str(uuid4()), 'order_id': body['order_id'], 'status': 'AUTHORIZED'}
        if os.environ.get('DEMO_FAIL_FIRST') == '1' and key not in failed:
            failed.add(key)
            return jsonify(type='about:blank', title='Service Unavailable', status=503, detail='Simulated lost reply after authorization'), 503
        return jsonify(records[key]), 201


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001)
