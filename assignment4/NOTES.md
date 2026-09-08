# CampusEats — Assignment 4: Rebuilding Orders in REST

**Team:** CampusEats  
**Members:** Mohit Tiwari (20252651034), Himanshi Pawar (20252651024), Ajay Kumar (20252651004), Asha Sahu (20252651013), Vedant Sahu (20252651063)

## Run and verify

Python 3.9 or newer; run these commands from `WebServices/assignment4`:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
# Terminal 1: independent demo dependency, with a simulated lost first reply
DEMO_FAIL_FIRST=1 .venv/bin/python demo/payments_service.py
# Terminal 2: Orders resolves Payments through configuration
PAYMENTS_URL=http://127.0.0.1:5001 .venv/bin/python app.py
# Terminal 3
.venv/bin/pytest -q
.venv/bin/openapi-spec-validator openapi.yaml
```

Alternatively, with ports 5000 and 5001 free, run `.venv/bin/python demo/capture_evidence.py`. It runs validation and tests, launches both services, executes actual `curl -i` requests, checks their status codes, and stops its servers. Captured outputs are in `evidence/`: `curl-transcript.txt`, `openapi-validation.txt`, `pytest.txt`, and both server logs. The Payments log shows a 503 after recording authorization, followed by a successful retry using its existing authorization. The curl transcript also includes an actual connection-failure fallback after the Payments process stops.

Tutorial 3 and Tutorial 4 folders were not present in the supplied repository. Existing Assignment 1–3 files have been preserved. `demo/payments_service.py` is explicitly a local Payments contract simulator, not a claimed implementation of the missing Tutorial 4 project; it runs as a separate HTTP server and imports no Orders code or store.

## A1. Service boundary and scope

Orders retains the Assignment 2 boundary: it owns Orders, OrderItems (embedded snapshots here), and OrderStatusHistory (the model's private history). User and vendor UUIDs and catalogue item UUIDs are references, not foreign keys into another service's storage. Payments owns authorizations; Orders calls its HTTP contract and never imports its data. Assignment 2 `design.pdf`, section 5, says to “keep item/payment checks synchronous (they gate success/failure)”; this exercise implements the synchronous payment check.

This is a runnable teaching slice, not the full Assignment 2 orchestration. The item names and prices supplied in the request are assumed to be snapshots from a previously validated catalogue/cart; this example does not authenticate users, verify catalogue prices/stock, validate delivery addresses, or assign delivery agents. Those responsibilities remain with their original services, and a deployed system must obtain trusted catalogue snapshots before charging. Monetary amounts use decimal strings and `Decimal`, never binary floating point.

The demo only authorizes a payment; it never captures funds. Cancellation records the order's cancellation synchronously, without claiming that a refund or authorization void has occurred. A real Payments adapter must add the Assignment 2 compensation workflow to void authorizations/refund captured payments. No invented background worker or asynchronous completion is claimed here.

## A2–A3. SOAP operations to nouns

These are proposed Orders operations in the document/literal style of Assignment 3, not quotations of operations that existed in its Payments WSDL.

| SOAP-style operation | Durable noun and REST mapping |
|---|---|
| `placeOrder(userId, vendorId, items, fulfillment, paymentToken)` | Creates an **order** → `POST /orders` |
| `getOrderStatus(orderId)` | Reads an **order** → `GET /orders/{order_id}` |
| `listOrders(userId, status)` | Filters **orders** → `GET /orders?status=PLACED&user_id=...` |
| `cancelOrder(orderId, reason)` | Creates a **cancellation** belonging to an order → `POST /orders/{order_id}/cancellation` |
| `getCancellation(orderId)` | Reads that **cancellation** → `GET /orders/{order_id}/cancellation` |

The collection noun `orders` is plural. `cancellation` is a singleton sub-resource: an order can have only one cancellation, as in the assignment's example. No URL contains add, get, set, place, or cancel verbs.

## A4. Resource table

| Method | URL | What it does | Success code | Failure codes |
|---|---|---|---|---|
| POST | `/orders` | Validate a cart snapshot, authorize payment, store an order; key required | 201 + Location; identical replay returns original 201 and body | 400 malformed shape/key; 409 reused key with changed body; 415 non-JSON; 422 invalid total/payment declined; 503 dependency unavailable |
| GET | `/orders/{order_id}` | Read one order | 200 | 400 invalid UUID; 404 absent order |
| GET | `/orders?status=PLACED&user_id=...` | List orders; both filters optional and combined | 200, including an empty list | 400 invalid, repeated, or unknown query parameter |
| POST | `/orders/{order_id}/cancellation` | Create a cancellation and change PLACED to CANCELLED | 201 + Location | 400 malformed body/UUID; 404 absent order; 409 order not PLACED; 415 non-JSON |
| GET | `/orders/{order_id}/cancellation` | Read the created cancellation | 200 | 400 invalid UUID; 404 absent order/cancellation |

All operations also document a default Problem response for framework failures, including 405, 413, and unexpected 500. Every error uses `errors.problem()` with `application/problem+json`. No work continues after a successful response, so 202 would misrepresent this implementation.

## A5. The difficult mapping

`cancelOrder` looks like an action, but its durable result is a cancellation with a reason and timestamp. I represented that result as a singleton sub-resource created with POST, and exposed GET at the returned Location. I rejected `/orders/{id}/cancel` because it exposes a verb, and DELETE on the order because cancellation must preserve the order and its history. A second cancellation receives 409 because the order is already CANCELLED, whereas a repeated create with its original idempotency key replays the original creation result.

## Contract and validation

`openapi.yaml` was written before the handler files. Request and response shapes are declared under `components.schemas`; operations reference them and shared failure responses. The captured validator result is `openapi.yaml: OK` (zero validation errors). Runtime validation is deliberately handwritten rather than inferred from the OpenAPI file.

`validation.validate()` checks object shape, required and unknown fields, canonical UUIDs, string lengths, item count, decimal price format, and strict integer quantities (rejecting Python booleans). `app.body()` calls it immediately after JSON parsing, before handlers access body fields. Malformed JSON is mapped by the HTTP exception handler into the same Problem shape; unsupported media types receive 415. Domain validation separately returns 422 when the syntactically valid cart has a zero or excessive total.

The stored Order has `internal_id`, `idempotency_key`, and history fields absent from `Order.as_json()`. The response is an explicit allowlist; payment tokens are sent only to Payments and are not stored or published by Orders. A SHA-256 fingerprint of the canonical request supports body comparison without retaining its token as plaintext.

## Retry safety and D3 fallback

`payments.Payments.authorize()` makes a real `POST {PAYMENTS_URL}/payments` with a 1-second connection timeout and a 2-second read timeout. It allows at most three attempts, waiting `0.1 × 2^attempt + uniform(0, 0.05)` seconds before retries. Only connection errors, timeouts, and 500/502/503/504 are retried; no 4xx is retried, including 408 and 429. Redirect following is disabled. Invalid success bodies and unexpected statuses fail closed.

Every attempt carries the same `Idempotency-Key: orders:<incoming-key>` and identical payment payload. Orders reserves its public ID and request fingerprint before the call, keeps that reservation after failure, and caches the original successful order representation. Thus both a timed-out outbound call and a later inbound retry reuse the same identity; a changed request using the key receives 409. The shared lock prevents concurrent duplicate creation inside this process.

**Fallback:** When Payments is unreachable or its reply cannot establish authorization, Orders returns 503 and does not publish an order. Accepting an unpaid order would falsely promise fulfillment, so failing is preferable to degrading. The client must retry the same body with the same key to resolve an authorization whose response may have been lost.

The allowed in-memory implementation has a deliberate limit: idempotency lasts only for the process lifetime, and the coarse lock serializes requests. Deployment would require durable, atomically reserved keys/results shared across workers, retained payment attempt IDs, reconciliation after crashes, and an authorization/compensation workflow. The separate demo dependency likewise loses its records on restart and is for local tests only.

## 1. WSDL versus OpenAPI line count

Using `wc -l ../assignment3/partner.wsdl openapi.yaml`: **WSDL: 111 lines; OpenAPI: 366 lines; OpenAPI is 255 lines longer.**

This is not an equal-operation size comparison: the WSDL describes one partner operation, whereas this OpenAPI file describes five HTTP operations, reusable JSON models, query/path/header parameters, Location headers, and explicit error responses. The WSDL must declare SOAP `message`/`part` wrappers and a document/literal SOAP binding with `SOAPAction`; OpenAPI needs neither. The YAML length also includes expanded formatting and repeated `$ref` pointers, so line count alone does not measure protocol overhead.

## 2. SOAP Fault replacement and the network

Quoted verbatim from `../assignment3/soap-fault.xml` (the fault inside its envelope):

```xml
<soapenv:Fault>
  <faultcode>soapenv:Client</faultcode>
  <faultstring>Payment authorization was declined</faultstring>
  <detail>
    <pay:GatewayFault>
      <pay:code>CARD_DECLINED</pay:code>
      <pay:message>The issuing bank declined the transaction.</pay:message>
      <pay:retryable>false</pay:retryable>
      <pay:gatewayReference>PGF-31D0A8B2</pay:gatewayReference>
    </pay:GatewayFault>
  </detail>
</soapenv:Fault>
```

The WSDL declares one fault, `GatewayFault`. Its concrete CARD_DECLINED example maps through the Payments adapter to Orders' HTTP **422 Unprocessable Content**:

```json
{"type":"about:blank","title":"Unprocessable Content","status":422,"detail":"PAYMENT_DECLINED: Payment was declined. Use another payment method."}
```

Assignment 3 `integration.md` also says: “Transport failure or a retryable gateway fault would instead map to `PAYMENT_UNAVAILABLE`”. This maps to 503 here. Both mappings are documented on POST /orders; partner-specific diagnostics and gateway references remain behind Payments. A 200 carrying an error tells HTTP-aware proxies, monitoring, and generic clients that the request succeeded; they cannot reliably classify failure or apply appropriate retry policies without understanding the body. HTTP error status and the problem body's status must agree.

## 3. Publish, find, bind

All three conceptual jobs remain, but the UDDI protocol and its business/service/tModel records disappear. **Publish:** commit the versioned OpenAPI contract alongside the service. **Find:** a developer/operator selects the reviewed service contract and supplies `PAYMENTS_URL` through deployment configuration. **Bind:** the HTTP client combines that configured base address with `/payments` and sends JSON according to the agreed contract, without WSDL-generated SOAP bindings. Assignment 3 already used a design-time catalogue rather than a running UDDI server; this implementation makes the configuration handoff explicit.

## 4. Who enforces the schema now?

The specific function is `validation.validate()`, called by `app.body()` before business logic. Without its strict integer check, `quantity: true` would pass ordinary Python arithmetic as 1 and could cause an incorrectly priced order. OpenAPI describes the required integer but does not install runtime enforcement; publishing a correct schema alone cannot reject such a request. The corresponding test verifies both 400 and that Payments was never called.

## 5. Where SOAP would still help

I would retain the Assignment 3 PaySecure partner edge when a financial partner requires message-level security across intermediaries. SOAP **with a configured WS-Security signature policy** buys verification of the signed message's integrity and sender authentication after TLS has terminated at a gateway. That guarantee comes from signatures and key/policy validation, not merely from SOAP or WSDL; the existing Assignment 3 WSDL does not itself implement it. Likewise, SOAP alone does not guarantee exactly-once charging: application idempotency and durable reconciliation remain necessary.
