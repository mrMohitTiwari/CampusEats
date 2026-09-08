from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import uuid4


def now():
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Order:
    order_id: str
    user_id: str
    vendor_id: str
    fulfillment_type: str
    items: list
    total_amount: str
    idempotency_key: str
    internal_id: str = field(default_factory=lambda: str(uuid4()))
    status: str = 'PLACED'
    created_at: str = field(default_factory=now)
    history: list = field(default_factory=list)
    cancellation: dict | None = None

    def as_json(self):
        # Explicit allowlist: internal IDs, key, and history never leave the service.
        return {name: deepcopy(getattr(self, name)) for name in (
            'order_id', 'user_id', 'vendor_id', 'fulfillment_type', 'items',
            'total_amount', 'status', 'created_at')}
