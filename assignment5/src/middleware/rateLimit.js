// B5 — per-client rate limit signalling
const WINDOW_MS = 60_000;
const LIMIT = 100;
const buckets = new Map();

module.exports = function rateLimit(req, res, next) {
  const client =
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.ip ||
    'anonymous';

  const now = Date.now();
  const bucket = buckets.get(client) || { count: 0, reset: now + WINDOW_MS };

  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + WINDOW_MS;
  }

  bucket.count += 1;
  buckets.set(client, bucket);

  const remaining = Math.max(0, LIMIT - bucket.count);
  res.set('X-RateLimit-Limit', String(LIMIT));
  res.set('X-RateLimit-Remaining', String(remaining));

  if (bucket.count > LIMIT) {
    const retry = Math.ceil((bucket.reset - now) / 1000);
    res.set('Retry-After', String(retry));
    return res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: retry,
    });
  }

  next();
};