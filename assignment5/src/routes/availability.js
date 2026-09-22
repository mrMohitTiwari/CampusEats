// src/routes/availability.js
// Optional standalone router for availability actions.
// Mount with: app.use('/availability', availabilityRouter);
// (Not required if you already implement POST /menu/:id/availability in menu.js — see NOTES.)

const express = require('express');
const router = express.Router();
const { db } = require('../data');
const { computeETag } = require('../middleware/etag');

// GET /availability/:itemId — read current availability (safe, idempotent)
router.get('/:itemId', (req, res) => {
  const item = db.menu.find((m) => m.id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ error: 'Not Found', message: 'Menu item not found' });
  }
  res.set('Cache-Control', 'private, max-age=30');
  res.json({ itemId: item.id, available: item.available });
});

// POST /availability/:itemId — set availability (non-CRUD action, A2)
// Body: { "available": true | false }
router.post('/:itemId', (req, res) => {
  const item = db.menu.find((m) => m.id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ error: 'Not Found', message: 'Menu item not found' });
  }

  // B2: 422 for a well-formed but domain-invalid payload
  if (typeof req.body?.available !== 'boolean') {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'available (boolean) is required',
    });
  }

  // If already in the desired state, this is a no-op (idempotent).
  item.available = req.body.available;
  item.version += 1;

  res.set('ETag', computeETag(item));
  res.status(200).json(item);
});

// OPTIONS /availability/:itemId — advertise allowed methods (A5)
router.options('/:itemId', (req, res) => {
  res.set('Allow', 'GET, POST, OPTIONS');
  res.status(204).end();
});

module.exports = router;