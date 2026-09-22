const express = require('express');
const router = express.Router();
const { db } = require('../data');
const { computeETag } = require('../middleware/etag');

// A4 — GET list with filter / sort / paginate via query string (pure read)
router.get('/', (req, res) => {
  const { q, sort, order = 'asc', page = '1', limit = '10' } = req.query;

  let items = [...db.menu];

  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter((m) => m.name.toLowerCase().includes(needle));
  }

  if (sort) {
    const dir = order === 'desc' ? -1 : 1;
    items.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const start = (p - 1) * l;
  const paged = items.slice(start, start + l);

  res.set('Cache-Control', 'private, max-age=30');
  res.status(200).json({
    total: items.length,
    page: p,
    limit: l,
    data: paged,
  });
});

// A5 — OPTIONS on one resource
router.options('/:id', (req, res) => {
  res.set('Allow', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.status(204).end();
});

// Single item GET with ETag + conditional 304 (B4, C1)
router.get('/:id', (req, res) => {
  const item = db.menu.find((m) => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Not Found', message: 'Menu item not found' });
  }
  res.json(item); // etag middleware injects ETag + 304 handling
});

// PUT — full replace (A1)
router.put('/:id', (req, res) => {
  const idx = db.menu.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Not Found' });
  }

  // C2 — If-Match precondition
  const currentTag = computeETag(db.menu[idx]);
  const ifMatch = req.headers['if-match'];
  if (ifMatch && ifMatch !== currentTag) {
    return res.status(412).json({
      error: 'Precondition Failed',
      message: 'ETag mismatch — resource changed',
    });
  }

  const { name, price, available } = req.body || {};
  if (typeof name !== 'string' || typeof price !== 'number') {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'name (string) and price (number) are required',
    });
  }

  db.menu[idx] = {
    id: db.menu[idx].id,
    name,
    price,
    available: !!available,
    version: db.menu[idx].version + 1,
  };

  const newTag = computeETag(db.menu[idx]);
  res.set('ETag', newTag);
  res.status(200).json(db.menu[idx]);
});

// PATCH — partial modify (A1)
router.patch('/:id', (req, res) => {
  const item = db.menu.find((m) => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not Found' });

  const ifMatch = req.headers['if-match'];
  const currentTag = computeETag(item);
  if (ifMatch && ifMatch !== currentTag) {
    return res.status(412).json({ error: 'Precondition Failed' });
  }

  if (req.body.name !== undefined) item.name = req.body.name;
  if (req.body.price !== undefined) item.price = req.body.price;
  if (req.body.available !== undefined) item.available = !!req.body.available;
  item.version += 1;

  res.set('ETag', computeETag(item));
  res.status(200).json(item);
});

// DELETE
router.delete('/:id', (req, res) => {
  const idx = db.menu.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not Found' });
  db.menu.splice(idx, 1);
  res.status(204).end();
});

// A2 — Non-CRUD action → POST to sub-resource
router.post('/:id/availability', (req, res) => {
  const item = db.menu.find((m) => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not Found' });
  if (typeof req.body?.available !== 'boolean') {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'available (boolean) required',
    });
  }
  item.available = req.body.available;
  item.version += 1;
  res.set('ETag', computeETag(item));
  res.status(200).json(item);
});

module.exports = router;