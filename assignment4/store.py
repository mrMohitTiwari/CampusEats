from threading import RLock


class Store:
    def __init__(self):
        self.orders = {}
        # Reserve the order ID before calling Payments, even if its reply is lost.
        self.attempts = {}
        self.lock = RLock()
