-- ============================================================
-- CampusEats — Database Schema (Task 5)
-- Boundary rule: every table belongs to exactly ONE service's
-- database. Foreign keys only exist WITHIN a service's own
-- tables. Where a row needs to reference an entity owned by a
-- different service (e.g. an Order needs a user_id), that value
-- is stored as a plain UUID column with NO foreign-key constraint
-- across the service boundary — the owning service is the only
-- source of truth for that entity, reached via its contract.
-- ============================================================


-- ================= USER SERVICE =================

CREATE TABLE Users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('student','vendor','agent')),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE Addresses (
    address_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    line1           VARCHAR(200) NOT NULL,
    city            VARCHAR(80)  NOT NULL,
    pincode         VARCHAR(12)  NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT false
);


-- ================= CATALOGUE SERVICE =================

CREATE TABLE Vendors (
    vendor_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    campus_location VARCHAR(120) NOT NULL,
    opening_time    TIME NOT NULL,
    closing_time    TIME NOT NULL,
    owner_user_id   UUID NOT NULL  -- reference only: owned by User Service, no FK
);

CREATE TABLE Categories (
    category_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES Vendors(vendor_id) ON DELETE CASCADE,
    name            VARCHAR(80) NOT NULL
);

CREATE TABLE MenuItems (
    item_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES Vendors(vendor_id) ON DELETE CASCADE,
    category_id     UUID REFERENCES Categories(category_id) ON DELETE SET NULL,
    name            VARCHAR(120) NOT NULL,
    price           DECIMAL(8,2) NOT NULL CHECK (price >= 0),
    in_stock        BOOLEAN NOT NULL DEFAULT true
);


-- ================= ORDER SERVICE =================

CREATE TABLE Orders (
    order_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL,   -- reference only: owned by User Service
    vendor_id         UUID NOT NULL,   -- reference only: owned by Catalogue Service
    status            VARCHAR(20) NOT NULL
                      CHECK (status IN ('PLACED','ACCEPTED','PREPARING','READY',
                                         'OUT_FOR_DELIVERY','DELIVERED','COMPLETED',
                                         'CANCELLED')),
    total_amount      DECIMAL(8,2) NOT NULL CHECK (total_amount >= 0),
    fulfillment_type  VARCHAR(10) NOT NULL CHECK (fulfillment_type IN ('delivery','pickup')),
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE OrderItems (
    order_item_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
    item_id             UUID NOT NULL,   -- reference only: owned by Catalogue Service
    item_name_snapshot  VARCHAR(120) NOT NULL,  -- copied at order time; Catalogue may change later
    quantity            INT NOT NULL CHECK (quantity > 0),
    unit_price_snapshot DECIMAL(8,2) NOT NULL CHECK (unit_price_snapshot >= 0)
);

CREATE TABLE OrderStatusHistory (
    history_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL,
    changed_at      TIMESTAMP NOT NULL DEFAULT now()
);


-- ================= PAYMENT SERVICE =================

CREATE TABLE Payments (
    payment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL,   -- reference only: owned by Order Service
    user_id         UUID NOT NULL,   -- reference only: owned by User Service
    amount          DECIMAL(8,2) NOT NULL CHECK (amount >= 0),
    status          VARCHAR(20) NOT NULL CHECK (status IN ('AUTHORIZED','CAPTURED','DECLINED','REFUNDED')),
    method          VARCHAR(30) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE Transactions (
    transaction_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id        UUID NOT NULL REFERENCES Payments(payment_id) ON DELETE CASCADE,
    gateway_ref        VARCHAR(120) NOT NULL,
    transaction_type   VARCHAR(10) NOT NULL CHECK (transaction_type IN ('charge','refund')),
    amount             DECIMAL(8,2) NOT NULL CHECK (amount >= 0),
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);


-- ================= DELIVERY SERVICE =================

CREATE TABLE DeliveryAgents (
    agent_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    status          VARCHAR(10)  NOT NULL CHECK (status IN ('available','busy','off'))
);

CREATE TABLE Deliveries (
    delivery_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL,   -- reference only: owned by Order Service
    agent_id         UUID REFERENCES DeliveryAgents(agent_id) ON DELETE SET NULL,
    pickup_location  VARCHAR(160) NOT NULL,
    drop_location    VARCHAR(160) NOT NULL,
    status           VARCHAR(20) NOT NULL
                     CHECK (status IN ('ASSIGNED','PICKED_UP','EN_ROUTE','DELIVERED','FAILED')),
    eta              TIMESTAMP
);


-- ================= REVIEW SERVICE =================

CREATE TABLE Reviews (
    review_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL,   -- reference only: owned by Order Service
    user_id         UUID NOT NULL,   -- reference only: owned by User Service
    vendor_id       UUID NOT NULL,   -- reference only: owned by Catalogue Service
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);
