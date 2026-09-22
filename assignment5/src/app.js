const express = require('express');
const compression = require('compression');

const securityHeaders = require('./middleware/securityHeaders');
const cors = require('./middleware/cors');
const methodOverride = require('./middleware/methodOverride');
const contentNegotiation = require('./middleware/contentNegotiation');
const rateLimit = require('./middleware/rateLimit');
const auth = require('./middleware/auth');
const idempotency = require('./middleware/idempotency');
const { etagAndCache } = require('./middleware/etag');

const menuRouter = require('./routes/menu');
const ordersRouter = require('./routes/orders');

function createApp() {
  const app = express();
  app.set('etag', false); // we manage our own ETags

  app.use(compression());         // B1 — gzip
  app.use(securityHeaders);       // B7
  app.use(cors);                  // B6
  app.use(express.json({ limit: '100kb' }));
  app.use(methodOverride);        // A5
  app.use(contentNegotiation);    // B1
  app.use(rateLimit);             // B5
  app.use(auth);                  // B3
  app.use(idempotency);           // C3
  app.use(etagAndCache);          // B4 / C1 / C2

  app.use('/menu', menuRouter);
  app.use('/orders', ordersRouter);

  // 404 fallback
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
  });

  // 400 for malformed JSON
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Bad Request', message: 'Malformed JSON' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = { createApp };