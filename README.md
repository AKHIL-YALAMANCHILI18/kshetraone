# KshetraOne — Smart Rural Operating Platform

> A unified rural livelihood operating system engineered for Indian farmers to manage mixed agriculture, dairy livestock, farm finances, warehouse storage, and local marketplace commerce.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Framework: Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](frontend/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20Python-009688.svg)](backend/)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2018%20(Neon)-336791.svg)](backend/database.py)

---

##  Overview

Over 85% of Indian farmers manage small mixed-livelihood holdings with both crops and cattle. **KshetraOne** replaces fragmented records, paper notebooks, and informal middlemen with a single, mobile-responsive platform:

1. **Crop Management**: Multi-plot tracking, sowing dates, variety logs, yield projections, and disease scouting.
2. **Dairy & Livestock**: Tag tracking, daily morning/evening milk yield recording (Fat/SNF), vaccination schedules, and feed expenses.
3. **Finance & Ledger**: Auto-reconciling farm cashbook tracking income from milk/produce and expenses from feed/fertilizers.
4. **Warehouse Storage**: Log grain/produce bags in cold storage to eliminate post-harvest distress sales.
5. **Direct Marketplace**: Connect farmers directly with buyers and millers at transparent mandi-referenced prices.
6. **Multilingual & Responsive**: Designed for rural smartphone screens (320px–430px) in English, Kannada, Hindi, Telugu, and Tamil.

---

##  Tech Stack

- **Frontend**: Next.js 16.3.8 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI (Python 3.14), Uvicorn ASGI Server, SQLAlchemy 2.0 ORM
- **Database**: Neon Serverless PostgreSQL 18 / Local SQLite 3
- **Security**: Argon2id password hashing, PyJWT Bearer authorization
- **Deployment**: Vercel (Frontend), Render (Backend)

---

##  Environment Variables

### 1. Frontend (`frontend/.env.local`)

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=https://kshetraone.onrender.com

# Firebase Authentication (Free Spark Tier for Phone OTP)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA7tsWtH4ufl3MAfdFJkZ6fHleWDBRb6ZY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=firstproject-3c5ca3b6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=firstproject-3c5ca3b6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=firstproject-3c5ca3b6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=596899348522
NEXT_PUBLIC_FIREBASE_APP_ID=1:596899348522:web:910ca77b0f444c49608353
```

### 2. Backend (`backend/.env`)

```env
# Database Connection (Neon PostgreSQL in Production, SQLite in Local Dev)
DATABASE_URL=postgresql://neondb_owner:npg_xxxx@ep-xyz.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Security
JWT_SECRET_KEY=kshetraone_super_secure_jwt_secret_key_production_2026_agro_hub
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

##  Setup & Local Installation

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+ & pip

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend API interactive docs will be available at: `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` on your browser (or toggle mobile view at 390px / 430px).

---

##  Test Cases & Sample Data

Run automated integration test suites:

```bash
# Backend Authentication & Persistence Test
python scratch/test_neon_audit.py

# End-to-End Playwright Browser Flow (Registration, Login, Onboarding, Dashboard)
python scratch/test_e2e_auth.py
```

---

## 📄 License & Architecture

- **Technical Architecture Document**: See [ARCHITECTURE.md](ARCHITECTURE.md) for Mermaid architectural flowcharts and data schemas.
- **License**: Released under the [MIT License](LICENSE).
