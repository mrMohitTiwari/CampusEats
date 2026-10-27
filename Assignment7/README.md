# CampusEats - GraphQL Menu Service
CS543 · Web Services · Assignment 7

## Team Details
- **Student 1 Name:** [Your Name] | **Roll No:** [Your Roll No]
- **Student 2 Name:** [Partner Name] | **Roll No:** [Partner Roll No]

## Demonstration Video
- **Drive Link:** [PASTE_YOUR_GOOGLE_DRIVE_VIDEO_LINK_HERE]

---

## Answers to Questions

### 1. Which CampusEats service did you pick?
We picked the **Menu (Dishes) Service**, modeling menu items with the attributes `id`, `name`, `price`, and `available`.

### 2. Name one field a client can skip and one it cannot (why we use the "!" sign).
- **Cannot Skip (`!`):** In `AddDishInput`, `name: String!` and `price: Float!` cannot be omitted because they are marked with an exclamation mark (`!`), representing a non-null constraint in GraphQL. If a client omits them or passes `null`, the GraphQL engine rejects the request before hitting resolvers.
- **Can Skip:** The `available: Boolean` field in `AddDishInput` has no `!` mark, so it is optional. If skipped by the client, it resolves to `null` (or adopts our default fallback `TRUE`).

### 3. Map it to SQL/other database: which part of your query became the WHERE, and which resolver ran the INSERT?
- **WHERE Clause:** The `id` argument in the GraphQL query `dish(id: ID!)` mapped directly to SQL:
  ```sql
  SELECT * FROM dishes WHERE id = ?