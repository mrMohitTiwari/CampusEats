const crypto = require('crypto');

function computeETag(obj) {
  const json = JSON.stringify(obj);
  const hash = crypto.createHash('sha1').update(json).digest('hex').slice(0, 16);
  return `"${hash}"`;
}

// B4 / C1 / C2 — Cache-Control, ETag, conditional reads & writes
function etagAndCache(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    // Set ETag on single-item GET responses
    if (req.method === 'GET' && body && typeof body === 'object' && body.id) {
      const tag = computeETag(body);
      res.set('ETag', tag);

      const inm = req.headers['if-none-match'];
      if (inm && inm === tag) {
        res.status(304).end();
        return res;
      }
      // Cache-Control for cacheable read
      if (!res.get('Cache-Control')) {
        res.set('Cache-Control', 'private, max-age=60, must-revalidate');
      }
    }
    return originalJson(body);
  };

  next();
}

module.exports = { etagAndCache, computeETag };