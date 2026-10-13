# NOTES.md
**Project:** CampusEats[cite: 1]
**Course:** CS 543 Web Services[cite: 1]

**Team Members:**
1. Mohit Tiwari (Roll No: 20252651034)[cite: 1]
2. Himanshi Pawar (Roll No: 20252651024)[cite: 1]
3. Ajay Kumar (Roll No: 20252651004)[cite: 1]
4. Asha Sahu (Roll No: 20252651013)[cite: 1]
5. Vedant Sahu (Roll No: 20252651063)[cite: 1]

### 1. Your status map
* **POST /orders**: 
  * `201 Created`: Success, order successfully placed and sent to the CampusEats system.
  * `400 Bad Request`: The request body was not valid JSON.
  * `422 Unprocessable Entity`: Business validation failed (e.g., empty cart, quantity ≤ 0, or missing delivery address).
  * `502 Bad Gateway`: The external PaySecure payment gateway or restaurant system is currently offline or unreachable.
* **GET /orders/{id}**:
  * `200 OK`: Success, the order details were found and returned.
  * `404 Not Found`: No order matches the requested ID in the database.
* **PATCH /orders/{id}**:
  * `200 OK`: Success, the order notes or status were successfully updated.
  * `409 Conflict`: Illegal transition (e.g., trying to modify or cancel an order that is already prepared or out for delivery).
* **DELETE /orders/{id}**:
  * `204 No Content`: Success, the order was canceled before preparation started.

### 2. Your type catalogue
* `validation-failed`: Triggers when the request body fails schema rules (e.g., missing address or negative quantity).
* `empty-cart`: Triggers when a POST request is made with no items in the order.
* `item-unavailable`: Triggers if a requested food item is currently out of stock at the campus cafeteria.
* `order-not-found`: Triggers when a GET/PATCH/DELETE operation targets an ID that does not exist in the database.
* `illegal-transition`: Triggers when modifying an order that has progressed past the 'preparation' stage (e.g., already dispatched).
* `payment-gateway-offline`: Triggers when CampusEats cannot connect to the backend PaySecure SOAP service to authorize the payment.

### 3. Paste one Problem Details body and label fields
```json
{
  "type": "[https://api.campuseats.com/errors/order-not-found](https://api.campuseats.com/errors/order-not-found)", // URI identifying the specific problem type
  "title": "Order Not Found", // Short, human-readable summary of the error
  "status": 404, // HTTP status code matching the header
  "detail": "No food order found with id ord_9999" // Human-readable explanation specific to this exact occurrence
}