// B6 — CORS
const ALLOWED_ORIGIN = '*';
const ALLOWED_HEADERS = 'Content-Type, Authorization, If-None-Match, If-Match, Idempotency-Key, X-HTTP-Method-Override, Accept';
const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';

module.exports = function cors(req, res, next) {
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.set('Access-Control-Expose-Headers', 'ETag, Location, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After');
  res.set('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
};