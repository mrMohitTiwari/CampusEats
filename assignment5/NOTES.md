# CampusEats — Assignment 5 NOTES

**Team ID:** CampusEats
**Members:**
| # | Name | Roll No |
|---|------|---------|
| 1 | Mohit Tiwari | 20252651034 |
| 2 | Himanshi Pawar | 20252651024 |
| 3 | Ajay Kumar | 20252651004 |
| 4 | Asha Sahu | 20252651013 |
| 5 | Vedant Sahu | 20252651063 |

---

## A1 — CampusEats Method Map

| Action | Method + URL |
|--------|--------------|
| List menu items | `GET /menu` |
| Read one menu item | `GET /menu/{id}` |
| Replace a menu item | `PUT /menu/{id}` |
| Modify a menu item | `PATCH /menu/{id}` |
| Remove a menu item | `DELETE /menu/{id}` |
| Set item availability | `POST /menu/{id}/availability` |
| List orders | `GET /orders` |
| Create order | `POST /orders` |
| Read order | `GET /orders/{id}` |
| Cancel order | `POST /orders/{id}/cancel` |
| Checkout order | `POST /orders/{id}/checkout` |

No verbs leak into URLs. All non-CRUD actions are modelled as `POST` to a **sub-resource**.

---

## A3 — Safe & Idempotent Endpoints

| Endpoint | Safe | Idempotent |
|----------|:----:|:----------:|
| `GET /menu` | ✅ | ✅ |
| `GET /menu/{id}` | ✅ | ✅ |
| `PUT /menu/{id}` | ❌ | ✅ |
| `PATCH /menu/{id}` | ❌ | ⚠️ (by design — may not be; here patched fields are absolute so ✅) |
| `DELETE /menu/{id}` | ❌ | ✅ |
| `POST /menu/{id}/availability` | ❌ | ✅ (sets absolute boolean) |
| `GET /orders` | ✅ | ✅ |
| `GET /orders/{id}` | ✅ | ✅ |
| `POST /orders` | ❌ | ❌ — made retry-safe via **Idempotency-Key** |
| `POST /orders/{id}/cancel` | ❌ | ✅ (once cancelled, further cancels are no-ops) |
| `POST /orders/{id}/checkout` | ❌ | ✅ (once confirmed, further checkouts are no-ops) |

**Neither safe nor idempotent:** `POST /orders`. Made retry-safe via `Idempotency-Key` (C3).

No `GET` changes state.

---

## A6 — One Full HTTP Exchange

### Request
```
POST /orders HTTP/1.1                ← request line (HTTP/1.1)
Host: localhost:3000                 ← Host header
Content-Type: application/json
Authorization: Bearer demo-token
Idempotency-Key: order-key-001
Accept: application/json

{"itemId":"m1","quantity":2}         ← JSON body
```

### Response
```
HTTP/1.1 201 Created                 ← status line
Location: /orders/o-abc12345
ETag: "f1e2d3c4b5a69788"
Content-Type: application/json; charset=utf-8
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Date: ...
Server: ...

{"id":"o-abc12345","itemId":"m1","quantity":2,"status":"PENDING","version":1}
```

---

## D2 — Headers Table

| Endpoint | Request Headers Needed | Response Headers Set |
|----------|------------------------|----------------------|
| `GET /menu` | `Accept` | `Content-Type`, `Cache-Control`, `X-RateLimit-*`, `X-Content-Type-Options`, `Strict-Transport-Security` |
| `GET /menu/{id}` | `Accept`, `If-None-Match` | `ETag`, `Cache-Control`, `Content-Type` |
| `PUT /menu/{id}` | `Authorization`, `Content-Type`, `If-Match` | `ETag`, `Content-Type` |
| `PATCH /menu/{id}` | `Authorization`, `Content-Type`, `If-Match` | `ETag`, `Content-Type` |
| `DELETE /menu/{id}` | `Authorization` | (empty) |
| `POST /menu/{id}/availability` | `Authorization`, `Content-Type` | `ETag`, `Content-Type` |
| `OPTIONS /menu/{id}` | `Origin`, `Access-Control-Request-Method` | `Allow`, `Access-Control-Allow-*` |
| `GET /orders` | `Authorization`, `Accept` | `Content-Type` |
| `POST /orders` | `Authorization`, `Content-Type`, `Idempotency-Key` | `Location`, `ETag`, `Idempotency-Key`, `Content-Type` |
| `GET /orders/{id}` | `Authorization`, `If-None-Match` | `ETag`, `Cache-Control` |
| `POST /orders/{id}/cancel` | `Authorization` | `Content-Type` |
| `POST /orders/{id}/checkout` | `Authorization` | `Content-Type` |

---

## C4 — Safe-Retry Plan

| Endpoint | Risk | Mechanism | Why |
|----------|------|-----------|-----|
| `POST /orders` | Duplicate order on retry | **Idempotency-Key** | Only non-idempotent write; replay returns original 201. |
| `PUT /menu/{id}` | Overwriting another editor's change | **If-Match** | Rejects stale writes with 412. |
| `PATCH /menu/{id}` | Same | **If-Match** | Same reason. |
| `GET /menu/{id}`, `GET /orders/{id}` | Wasted bandwidth | **If-None-Match** | Returns 304 when unchanged. |
| `POST /orders/{id}/cancel` / `checkout` | Repeated fire | (naturally idempotent) | Server checks state; second call is a no-op or 409. |
| `DELETE /menu/{id}` | Repeat delete | (naturally idempotent) | Second call returns 404 but effect equal. |
| All `GET` | None | (safe) | Safe methods need no retry protection. |

---

## Answers

### 1. Three endpoints — method, status, key header

| Endpoint | Method | Success status | Key header | Why |
|----------|--------|---------------|-----------|-----|
| `/orders` (create) | `POST` | `201` | `Location` | The client learns the URL of the newly-created order — the fundamental contract of 201. |
| `/menu/{id}` (read) | `GET` | `200` | `ETag` | Enables conditional GETs (304) and prevents cache staleness. |
| `/orders` (list, protected) | `GET` | `200` | `Authorization` (request) / `WWW-Authenticate` (401) | The server must tell unauthorized callers how to authenticate. |

### 2. Safe / idempotent

See A3 table. **Neither safe nor idempotent:** `POST /orders`. Made retry-safe with `Idempotency-Key` middleware, which stores `(key → {status, body, headers})` and replays the exact response on duplicates.

### 3. ETag demo

- ETag from service: `"f1e2d3c4b5a69788"` for order `o-abc12345`.
- **304:** `GET /orders/o-abc12345` with `If-None-Match: "f1e2d3c4b5a69788"` → 304, no body. Saves bandwidth.
- **412:** `PUT /menu/m1` with a stale `If-Match` after another edit changed the ETag. Prevents silent overwrite (lost-update problem).

### 4. 422 vs 400

- **400:** `POST /orders` with `{"quantity":2}` (missing `itemId`) — malformed syntax / missing required field.
- **422:** `POST /orders` with `{"itemId":"does-not-exist","quantity":1}` — syntactically valid, well-formed JSON, but semantically invalid domain reference.
- Difference: **400 = can't parse / structurally invalid; 422 = parsed but domain refused.**

### 5. Blocked by browser — CORS

The browser (Same-Origin Policy) blocked the response — the server *did* return 200 (as logs show). The fix is the response header `Access-Control-Allow-Origin: *` (or the specific origin), which our CORS middleware sets, plus answering the `OPTIONS` preflight.

### 6. Cache-Control

- **Cacheable:** `GET /menu/{id}` → `Cache-Control: private, max-age=60, must-revalidate` — menu items change rarely, safe to cache short-term.
- **no-store:** `GET /orders/{id}` (order contents) → would use `Cache-Control: no-store` — order data is user-specific and should not persist in shared caches.

### 7. When POST > GET for search

`GET` search is right when the query fits in a URL and is idempotent/safe. **POST** becomes correct when the query is:
- Too large (many filter facets / long boolean expressions),
- Contains sensitive data you don't want in URL logs,
- Requires non-idempotent analytics (e.g. logging each search for billing).

Trade-off: POST search **loses** safe/idempotent semantics, browser caching, bookmarkability, and prefetching — so you give up HTTP-layer caching and sharable links.

### 8. Location

- **201 Created:** `Location` points to the URL of the **newly-created resource** (e.g. `/orders/o-abc12345`).
- **3xx redirect:** `Location` points to the **target URL** the client should follow (the resource that replaced the old one, or the canonical URL).

---

## Deliverables checklist

- [x] Updated service folder (`server.js`, `src/`, `openapi.yaml`)
- [x] `curl-transcript.txt` with -v: 201, idempotent replay, 304, 412, 400, 404, 401
- [x] `NOTES.md` (this file): method map, headers table, safe-retry plan, 8 answers
- [x] `tests/` folder