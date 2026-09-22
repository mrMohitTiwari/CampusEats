const { randomUUID } = require('uuid');

const db = {
  menu: [
    { id: 'm1', name: 'Masala Dosa', price: 80, available: true, version: 1 },
    { id: 'm2', name: 'Paneer Wrap', price: 120, available: true, version: 1 },
    { id: 'm3', name: 'Cold Coffee', price: 60, available: false, version: 1 },
  ],
  orders: [],
  idempotency: new Map(), // key -> { status, body, headers }
};

function newId(prefix = 'o') {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

module.exports = { db, newId };