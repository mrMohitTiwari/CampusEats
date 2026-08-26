# CampusEats

Course assignment repository for **CS 543 Web Services**. It contains the
CampusEats HTTP investigation, service design, and external SOAP partner
integration completed across Assignments 1–3.

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

## How I captured HTTP logs
Used PowerShell with `curl.exe -i` against JSONPlaceholder API:
- `https://jsonplaceholder.typicode.com/posts/1`
- `https://jsonplaceholder.typicode.com/posts/2`
- `https://jsonplaceholder.typicode.com/users/1`
- `https://jsonplaceholder.typicode.com/comments?postId=1`
- `https://jsonplaceholder.typicode.com/posts/999999` (404)

## Repository setup

The assignment structure and deliverables are committed incrementally to show
the development history. Assignment 3 is complete and its upload archive is
available in the `assignment3` directory.
