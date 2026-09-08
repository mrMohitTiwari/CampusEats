import os
import random
import time
import requests
from errors import APIError


class Payments:
    def __init__(self, base_url=None, post=None, sleep=time.sleep, jitter=random.uniform):
        self.base_url = base_url if base_url is not None else os.environ.get('PAYMENTS_URL')
        self.post = post or requests.post
        self.sleep, self.jitter = sleep, jitter

    def authorize(self, payload, key):
        if not self.base_url:
            raise APIError(503, 'Service Unavailable', 'PAYMENT_UNAVAILABLE: configure PAYMENTS_URL.')
        for attempt in range(3):
            try:
                response = self.post(self.base_url.rstrip('/') + '/payments', json=payload,
                                     headers={'Idempotency-Key': key}, timeout=(1, 2),
                                     allow_redirects=False)
            except (requests.Timeout, requests.ConnectionError):
                response = None
            if response is not None:
                if 400 <= response.status_code < 500:
                    # Never retry any 4xx, including 408 and 429.
                    if response.status_code == 422:
                        raise APIError(422, 'Unprocessable Content', 'PAYMENT_DECLINED: Payment was declined. Use another payment method.')
                    raise APIError(503, 'Service Unavailable', 'PAYMENT_UNAVAILABLE: dependency rejected authorization.')
                if response.status_code in (200, 201):
                    try:
                        data = response.json()
                        if isinstance(data, dict) and data.get('status') == 'AUTHORIZED':
                            return
                    except ValueError:
                        pass
                    break
                if response.status_code not in (500, 502, 503, 504):
                    break
            if attempt < 2:
                self.sleep(0.1 * 2 ** attempt + self.jitter(0, 0.05))
        raise APIError(503, 'Service Unavailable', 'PAYMENT_UNAVAILABLE: retry with the same Idempotency-Key.')
