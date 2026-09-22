// B1 — Content-Type & negotiation
module.exports = function contentNegotiation(req, res, next) {
  // Accept header check for JSON
  const accept = req.headers['accept'] || '*/*';
  const acceptsJson =
    accept.includes('*/*') ||
    accept.includes('application/json') ||
    accept.includes('application/*');

  if (!acceptsJson) {
    return res.status(406).json({
      error: 'Not Acceptable',
      message: 'Only application/json is supported',
    });
  }

  // Body-carrying methods must send application/json
  const bodyMethods = ['POST', 'PUT', 'PATCH'];
  if (bodyMethods.includes(req.method)) {
    const ct = (req.headers['content-type'] || '').split(';')[0].trim();
    if (ct && ct !== 'application/json') {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json',
      });
    }
  }

  res.type('application/json');
  next();
};