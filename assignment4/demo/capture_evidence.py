"""Run from assignment4 with .venv/bin/python demo/capture_evidence.py."""
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys
import time
import urllib.request

root = Path(__file__).resolve().parents[1]
os.chdir(root)
evidence = root / 'evidence'
evidence.mkdir(exist_ok=True)
payload = {'user_id': '11111111-1111-4111-8111-111111111111', 'vendor_id': '22222222-2222-4222-8222-222222222222', 'fulfillment_type': 'pickup', 'payment_token': 'demo-token', 'items': [{'item_id': '33333333-3333-4333-8333-333333333333', 'item_name_snapshot': 'Veg thali', 'quantity': 2, 'unit_price_snapshot': '75.00'}]}
for filename, command in [('pytest.txt', [sys.executable, '-m', 'pytest', '-q']), ('openapi-validation.txt', [str(Path(sys.executable).parent / 'openapi-spec-validator'), 'openapi.yaml'])]:
    result = subprocess.run(command, capture_output=True, text=True)
    (evidence / filename).write_text('$ ' + shlex.join(command) + '\n' + result.stdout + result.stderr)
    if result.returncode:
        raise SystemExit(result.stdout + result.stderr)
processes = []
logs = []
try:
    for script, env, filename in [('demo/payments_service.py', {'DEMO_FAIL_FIRST': '1'}, 'payments-server.txt'), ('app.py', {'PAYMENTS_URL': 'http://127.0.0.1:5001'}, 'orders-server.txt')]:
        log = (evidence / filename).open('w')
        logs.append(log)
        processes.append(subprocess.Popen([sys.executable, '-u', script], env={**os.environ, **env}, stdout=log, stderr=subprocess.STDOUT))
    for _ in range(50):
        if any(p.poll() is not None for p in processes):
            raise RuntimeError('Server exited; inspect evidence server logs.')
        try:
            urllib.request.urlopen('http://127.0.0.1:5000/orders', timeout=0.2).close()
            break
        except OSError:
            time.sleep(0.1)
    else:
        raise RuntimeError('Orders server did not start.')
    with (evidence / 'curl-transcript.txt').open('w') as transcript:
        def curl(path, expected, data=None, key=None):
            cmd = ['curl', '-i', '-sS', '--max-time', '15']
            if data is not None:
                cmd += ['-X', 'POST', '-H', 'Content-Type: application/json', '--data', data]
            if key:
                cmd += ['-H', 'Idempotency-Key: ' + key]
            cmd += ['http://127.0.0.1:5000' + path]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            transcript.write('$ ' + shlex.join(cmd) + '\n' + result.stdout + '\n\n')
            assert int(result.stdout.splitlines()[0].split()[1]) == expected, result.stdout
            return json.loads(result.stdout.split('\n\n', 1)[1])
        first = curl('/orders', 201, json.dumps(payload), 'curl-demo-1')
        assert curl('/orders', 201, json.dumps(payload), 'curl-demo-1') == first
        curl('/orders', 400, '{', 'malformed')
        curl('/orders/00000000-0000-4000-8000-000000000000', 404)
        uri = '/orders/' + first['order_id']
        curl(uri, 200)
        curl('/orders?status=PLACED', 200)
        curl(uri + '/cancellation', 201, json.dumps({'reason': 'Changed plans'}))
        curl(uri + '/cancellation', 409, json.dumps({'reason': 'Again'}))
        curl(uri + '/cancellation', 200)
        payload['payment_token'] = 'decline-demo'
        curl('/orders', 422, json.dumps(payload), 'curl-decline')
        processes[0].terminate()
        processes[0].wait(timeout=5)
        payload['payment_token'] = 'demo-token'
        curl('/orders', 503, json.dumps(payload), 'curl-unavailable')
    print('Captured passing pytest, OpenAPI validation, and curl evidence (201/200/400/404/409/422/503).')
finally:
    for process in processes:
        if process.poll() is None:
            process.terminate()
            process.wait(timeout=5)
    for log in logs:
        log.close()
