// A5 — X-HTTP-Method-Override documented fallback
const ALLOWED = new Set(['PUT', 'PATCH', 'DELETE']);

module.exports = function methodOverride(req, res, next) {
  const override = req.headers['x-http-method-override'];
  if (override && req.method === 'POST' && ALLOWED.has(override.toUpperCase())) {
    req.originalMethod = req.method;
    req.method = override.toUpperCase();
    res.set('X-HTTP-Method-Override', override.toUpperCase());
  }
  next();
};