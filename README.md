# CampusEats

Course assignment repository for **CS 543 Web Services**. It contains the
CampusEats HTTP investigation, service design, external SOAP partner
integration, REST API implementation, and GraphQL service completed across the semester.

## Team

| # | Name | Roll Number |
|---|------|--------------|
| 1 | Mohit Tiwari | 20252651034 |
| 2 | Himanshi Pawar | 20252651024 |
| 3 | Ajay Kumar | 20252651004 |
| 4 | Asha Sahu | 20252651013 |
| 5 | Vedant Sahu | 20252651063 |

## Assignments

### Assignment 1 — HTTP by Hand and Project Setup

- `Assignment1/brief (1).md` — one-page CampusEats system brief
- `Assignment1/http-log.md` — five annotated curl request/response pairs,
  including one `404 Not Found` response
- `Assignment1/network-analysis.md` — browser DevTools network observations

### Assignment 2 — Services, Contracts and Schema

- `assignment2/design.pdf` — service responsibilities and API contracts
- `assignment2/services.drawio` and `services.drawio.png` — service-boundary
  diagram
- `assignment2/schema.sql` — database-per-service relational schema
- `assignment2/schema.drawio` and `ER_DIAG.png` — entity-relationship design

### Assignment 3 — External SOAP Partner Integration

Assignment 3 integrates the fictional PaySecure payment gateway with the
CampusEats Payment Service at design time. It defines one document/literal
SOAP 1.1 operation, `chargePayment`, and maps partner faults into the
CampusEats payment contract.

- `assignment3/integration.pdf` — context, HTTP binding, discovery catalogue
  record, and fault mapping
- `assignment3/partner.wsdl` — complete PaySecure partner contract
- `assignment3/soap-request.xml` — hand-authored SOAP request with credentials
  in the header
- `assignment3/soap-response.xml` — successful authorization response
- `assignment3/soap-fault.xml` — realistic card-declined SOAP fault
- `assignment3/CampusEats_Assignment3.zip` — ready-to-upload submission archive

### Assignment 4 — Orders REST Service

See [assignment4/NOTES.md](assignment4/NOTES.md) for the team details, resource model, SOAP comparison, setup instructions, and retry/fallback design. The folder includes the OpenAPI contract, Flask implementation, tests, an independent Payments demo, and captured curl/validator/pytest evidence.

### Assignment 7 — CampusEats GraphQL Menu Service

Assignment 7 implements the CampusEats Menu Service backed by a GraphQL API and MySQL database. It supports full read/write operations via a GraphQL query and mutation, consumed by a responsive HTML/CSS/JS frontend interface.

- `schema.graphql` — GraphQL schema defining the `Dish` object type, input types, `dishes` / `dish(id)` queries, and `addDish` mutation
- `server.js` — Apollo Server implementation with resolvers executing SQL operations
- `db.js` — Shared MySQL connection pool using `mysql2/promise`
- `schema.sql` — MySQL database creation (`campuseats`), `dishes` table DDL, and initial seed rows
- `public/index.html` & `public/style.css` — Interactive frontend interface performing client-side GraphQL queries and mutations via `fetch()`
- `screenshot-before.png` & `screenshot-after.png` — UI evidence before and after executing the `addDish` mutation
- **Demonstration Video:** [PASTE_YOUR_GOOGLE_DRIVE_VIDEO_LINK_HERE]

#### Assignment 7 Q&A

1. **Which CampusEats service did you pick?**  
   We selected the **Menu (Dishes) Service**, exposing dishes with properties `id`, `name`, `price`, and `available`.

2. **Name one field a client can skip and one it cannot (why we use the "!" sign).**  
   - **Cannot skip (`!`):** In `AddDishInput`, `name: String!` and `price: Float!` are marked with an exclamation mark (`!`), representing a non-null constraint in GraphQL. If omitted or passed as `null`, GraphQL rejects the request at the validation layer before resolvers execute.
   - **Can skip:** The `available: Boolean` field omits the `!`, making it optional for the client. When omitted, it resolves to `null` or falls back to the database default (`TRUE`).

3. **Map it to SQL/other database: which part of your query became the WHERE, and which resolver ran the INSERT?**  
   - **WHERE clause:** The `id` argument in the query `dish(id: ID!)` mapped directly to:
     ```sql
     SELECT * FROM dishes WHERE id = ?
     ```
   - **INSERT resolver:** The `Mutation.addDish` resolver ran the SQL INSERT statement:
     ```sql
     INSERT INTO dishes (name, price, available) VALUES (?, ?, ?)
     ```

## How I captured HTTP logs
Used PowerShell with `curl.exe -i` against JSONPlaceholder API:
- `https://jsonplaceholder.typicode.com/posts/1`
- `https://jsonplaceholder.typicode.com/posts/2`
- `https://jsonplaceholder.typicode.com/users/1`
- `https://jsonplaceholder.typicode.com/comments?postId=1`
- `https://jsonplaceholder.typicode.com/posts/999999` (404)

## How to Run Assignment 7 (GraphQL Service)

1. **Import Database:**
   ```powershell
   Get-Content schema.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p