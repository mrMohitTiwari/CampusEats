// tests/api.test.js
const request = require('supertest');
const { createApp } = require('../src/app');

describe('CampusEats Assignment 5', () => {
  let app;
  beforeEach(() => {
    app = createApp();
  });

  // --- A1 / B2: create + Location ---
  test('create order returns 201 + Location', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer t')
      .set('Idempotency-Key', 'k1')
      .send({ itemId: 'm1', quantity: 1 });
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(/^\/orders\//);
  });

  // --- C3: idempotent replay ---
  test('idempotent replay returns same Location', async () => {
    const first = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer t')
      .set('Idempotency-Key', 'k2')
      .send({ itemId: 'm1', quantity: 1 });
    const second = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer t')
      .set('Idempotency-Key', 'k2')
      .send({ itemId: 'm1', quantity: 1 });
    expect(second.status).toBe(201);
    expect(second.headers.location).toBe(first.headers.location);
    expect(second.headers['idempotency-replayed']).toBe('true');
  });

  // --- B3: auth ---
  test('missing token -> 401', async () => {
    const res = await request(app).get('/orders');
    expect(res.status).toBe(401);
    expect(res.headers['www-authenticate']).toMatch(/Bearer/);
  });

  // --- B2: 400 vs 422 ---
  test('malformed body -> 400', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer t')
      .send({ quantity: 2 });
    expect(res.status).toBe(400);
  });

  test('unknown itemId -> 422', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer t')
      .send({ itemId: 'nope', quantity: 1 });
    expect(res.status).toBe(422);
  });

  // --- B2: 404 ---
  test('missing order -> 404', async () => {
    const res = await request(app)
      .get('/orders/nope')
      .set('Authorization', 'Bearer t');
    expect(res.status).toBe(404);
  });

  // --- B4 / C1: ETag + 304 ---
  test('conditional GET -> 304', async () => {
    const created = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer t')
      .set('Idempotency-Key', 'k3')
      .send({ itemId: 'm1', quantity: 1 });

    const id = created.body.id;
    const read = await request(app)
      .get(`/orders/${id}`)
      .set('Authorization', 'Bearer t');
    const etag = read.headers.etag;

    const conditional = await request(app)
      .get(`/orders/${id}`)
      .set('Authorization', 'Bearer t')
      .set('If-None-Match', etag);
    expect(conditional.status).toBe(304);
  });

  // --- C2: 412 ---
  test('conditional write mismatch -> 412', async () => {
    const res = await request(app)
      .put('/menu/m1')
      .set('Authorization', 'Bearer t')
      .set('If-Match', '"bogus"')
      .send({ name: 'X', price: 10 });
    expect(res.status).toBe(412);
  });

  // --- A5 / B6: OPTIONS + CORS ---
  test('OPTIONS returns Allow + CORS', async () => {
    const res = await request(app)
      .options('/menu/m1')
      .set('Origin', 'https://example.com');
    expect(res.status).toBe(204);
    expect(res.headers.allow).toMatch(/PUT/);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  // --- B1: 406 negotiation ---
  test('Accept: application/xml -> 406', async () => {
    const res = await request(app)
      .get('/menu')
      .set('Accept', 'application/xml');
    expect(res.status).toBe(406);
  });

  // --- A2: non-CRUD sub-resource action ---
  test('cancel order via sub-resource', async () => {
    const created = await request(app)
      .post('/orders')
      .set('Authorization', 'Bearer t')
      .set('Idempotency-Key', 'k4')
      .send({ itemId: 'm1', quantity: 1 });
    const id = created.body.id;

    const cancelled = await request(app)
      .post(`/orders/${id}/cancel`)
      .set('Authorization', 'Bearer t');
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.status).toBe('CANCELLED');
  });

  // --- A1: PUT replaces, PATCH modifies ---
  test('PUT replaces a menu item', async () => {
    const res = await request(app)
      .put('/menu/m2')
      .set('Authorization', 'Bearer t')
      .send({ name: 'Paneer Wrap Deluxe', price: 150, available: true });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Paneer Wrap Deluxe');
  });

  test('PATCH partially modifies a menu item', async () => {
    const res = await request(app)
      .patch('/menu/m2')
      .set('Authorization', 'Bearer t')
      .send({ price: 130 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(130);
  });

  // --- A1: DELETE ---
  test('DELETE returns 204', async () => {
    const res = await request(app)
      .delete('/menu/m3')
      .set('Authorization', 'Bearer t');
    expect(res.status).toBe(204);
  });

  // --- B7: security headers ---
  test('security headers are present', async () => {
    const res = await request(app).get('/menu');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toMatch(/max-age=/);
  });
});