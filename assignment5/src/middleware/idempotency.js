// C3 — Idempotency-Key replay
const { db } = require('../data');

module.exports = function idempotency(req, res, next) {
  if (req.method !== 'POST') return next();
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const cached = db.idempotency.get(key);
  if (cached) {
    res.set('Idempotency-Key', key);
    res.set('Idempotency-Replayed', 'true');
    for (const [k, v] of Object.entries(cached.headers)) res.set(k, v);
    return res.status(cached.status).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400) {
      const headers = {};
      ['Location', 'ETag'].forEach((h) => {
        const v = res.get(h);
        if (v) headers[h] = v;
      });
      db.idempotency.set(key, {
        status: res.statusCode,
        body,
        headers,
      });
      res.set('Idempotency-Key', key);
    }
    return originalJson(body);
  };

  next();
};