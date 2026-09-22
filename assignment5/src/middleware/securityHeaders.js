// B7 — Security & general headers
module.exports = function securityHeaders(req, res, next) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};