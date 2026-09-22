// B3 — Authorization: Bearer <token>
const PROTECTED = [
  { method: 'POST', path: /^\/orders$/ },
  { method: 'GET', path: /^\/orders(\/.*)?$/ },
  { method: 'PUT', path: /^\/menu\/[^/]+$/ },
  { method: 'PATCH', path: /^\/menu\/[^/]+$/ },
  { method: 'DELETE', path: /^\/menu\/[^/]+$/ },
  { method: 'POST', path: /^\/menu\/[^/]+\/availability$/ },
];

module.exports = function auth(req, res, next) {
  const needsAuth = PROTECTED.some(
    (r) => r.method === req.method && r.path.test(req.path)
  );
  if (!needsAuth) return next();

  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ') || header.trim() === 'Bearer') {
    return res
      .status(401)
      .set('WWW-Authenticate', 'Bearer realm="CampusEats"')
      .json({ error: 'Unauthorized', message: 'Missing or empty bearer token' });
  }
  req.user = header.slice('Bearer '.length);
  next();
};