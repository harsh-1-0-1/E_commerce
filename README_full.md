
# 🛒 Full-Stack E-Commerce Application

A **production-grade learning project** showcasing a modern **React frontend** integrated with a **FastAPI + SQLAlchemy backend**, implementing real-world e-commerce workflows such as authentication, cart management, order processing, inventory reservation, and payment handling.

> **Status:** Learning & Demo Project
> **Frontend:** React + Vite
> **Backend:** FastAPI + SQLAlchemy
> **Database:** SQLite (development)
> **Payments:** Razorpay (test mode)

---

## ✨ Key Highlights

* End-to-end **full-stack implementation**
* Clean **3-tier backend architecture**
* Real-world **inventory reservation & rollback logic**
* **Idempotent payment handling**
* Fully **JWT-secured API**
* Modern, responsive **React + Tailwind UI**
* Consistent, standardized **API response format**

---

## 🧩 System Overview

```
┌──────────────┐        HTTP / JSON        ┌────────────────────┐
│  React UI    │  ─────────────────────▶  │  FastAPI Backend   │
│ (Vite + TS)  │                          │  (Business Logic)  │
└──────────────┘                          └─────────┬──────────┘
                                                     │
                                                     ▼
                                           ┌──────────────────┐
                                           │ SQLAlchemy ORM   │
                                           │ + SQLite (Dev)   │
                                           └──────────────────┘
```

---

## 📦 Features

### 🔐 Authentication

* JWT-based authentication
* Protected routes (frontend & backend)
* Role-based access (User / Admin)
* Secure password hashing (Argon2)

### 🛍️ Product & Inventory

* Product catalog with filtering
* Admin inventory management
* Tri-state stock model:

  * `total_stock`
  * `available_stock`
  * `reserved_stock`

### 🛒 Cart & Orders

* Persistent user cart
* Quantity management
* Order creation from cart
* Order lifecycle tracking

### 💳 Payments (Razorpay – Test Mode)

* Payment session creation
* Cryptographic signature verification
* Idempotent verification
* Inventory rollback on failure

### 🎨 Frontend UI

* Modern, minimal UI with Tailwind CSS
* Responsive design
* Protected routes
* Centralized API services
* Toast-based error & success handling

---

## 🛠 Tech Stack

### Frontend

* **React 18**
* **Vite**
* **React Router**
* **Axios**
* **Tailwind CSS**

### Backend

* **FastAPI**
* **SQLAlchemy 2.0**
* **Alembic**
* **Pydantic v2**
* **JWT (python-jose)**
* **Argon2**
* **Loguru**

---

## 📁 Repository Structure

```
.
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── schemas/
│   ├── utils/
│   ├── alembic/
│   └── main.py
│
├── STARTUP.md                # Detailed setup guide
├── .env.example
└── README.md
```

---

## 🔄 Core Workflows

### 🧾 Order Creation & Inventory Reservation

```
Cart → Checkout
   ↓
Validate stock
   ↓
Reserve inventory (available ↓, reserved ↑)
   ↓
Create order (PENDING)
```

### 💳 Payment Flow

```
Create payment session
   ↓
Razorpay checkout
   ↓
Verify signature
   ↓
SUCCESS → finalize stock
FAILED  → rollback inventory
```

---

## 📊 Inventory Model

| Field             | Meaning                         |
| ----------------- | ------------------------------- |
| `total_stock`     | Physical inventory              |
| `available_stock` | Items ready to sell             |
| `reserved_stock`  | Items locked for pending orders |

**Invariant:**
`available_stock + reserved_stock ≤ total_stock`

---

## 🔐 API Response Standard

All backend APIs return a consistent response shape:

```json
{
  "status_code": 200,
  "message": "Success",
  "data": {},
  "error": null
}
```

This allows predictable frontend handling and cleaner error management.

---

## 🚀 Getting Started (Quick)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload
```

Open: `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000`

---

## 🧪 Razorpay Test Card

```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any
```

⚠️ **Test mode only — no real payments.**

---

## 📈 Learning Outcomes

This project demonstrates:

* Full-stack system design
* Backend architecture best practices
* Transaction safety & idempotency
* Inventory consistency under concurrency
* Payment gateway integration
* API standardization
* Clean frontend–backend separation

---

## 🚧 Future Enhancements

* Razorpay webhooks
* Order cancellation & refunds
* PostgreSQL migration
* Admin dashboard
* Rate limiting & caching
* Automated test suite
* API versioning
* Monitoring & health checks

---

## ⚠️ Disclaimer

This is a **learning & demonstration project**, not production-ready.

* SQLite used for development only
* No webhook-based payment confirmation
* Open CORS policy
* No rate limiting

---

## 👤 Author

**Harsh Sen**
---

**Last Updated:** December 2025
**License:** Educational Use Only
