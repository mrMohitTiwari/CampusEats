const express = require('express');
const router = express.Router();
const { db, newId } = require('../data');
const { computeETag } = require('../middleware/etag');

// A3 — list orders (safe, idempotent)
router.get('/', (req, res) => {
  res.status(200).json({ data: db.orders });
});

// B2 — 201 + Location on create; A2 uses sub-resources for actions
router.post('/', (req, res) => {
  const { itemId, quantity } = req.body || {};

  // B2 — 400 for malformed (missing fields), 422 for domain refusal
  if (!itemId || typeof quantity !== 'number') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'itemId and quantity (number) are required',
    });
  }

  const menuItem = db.menu.find((m) => m.id === itemId);
  if (!menuItem) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'itemId does not reference a known menu item',
    });
  }
  if (!menuItem.available) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Item is currently unavailable',
    });
  }

  const order = {
    id: newId('o'),
    itemId,
    quantity,
    status: 'PENDING',
    version: 1,
  };
  db.orders.push(order);

  const location = `/orders/${order.id}`;
  res.set('Location', location);
  res.set('ETag', computeETag(order));
  res.status(201).json(order);
});

// Single order read with ETag + 304
router.get('/:id', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not Found' });
  res.json(order);
});

// A2 — Non-CRUD action: cancel
router.post('/:id/cancel', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not Found' });
  if (order.status === 'CANCELLED') {
    return res.status(409).json({ error: 'Conflict', message: 'Already cancelled' });
  }
  order.status = 'CANCELLED';
  order.version += 1;
  res.status(200).json(order);
});

// A2 — Non-CRUD action: checkout
router.post('/:id/checkout', (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not Found' });
  if (order.status !== 'PENDING') {
    return res.status(409).json({ error: 'Conflict', message: `Cannot checkout order in ${order.status}` });
  }
  order.status = 'CONFIRMED';
  order.version += 1;
  res.status(200).json(order);
});

module.exports = router;