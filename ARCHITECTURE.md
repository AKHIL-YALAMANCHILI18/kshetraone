# KshetraOne — Technical Design & Architecture Document

## 1. Executive Summary

KshetraOne is an integrated rural operating platform engineered for Indian smallholder farming households practicing mixed agriculture and dairy livelihoods. It unifies farm management, livestock health, financial tracking, warehouse logistics, and local marketplace commerce into a responsive, mobile-first system.

---

## 2. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 / React 19)"]
        UI["Mobile-First UI (Tailwind CSS)"]
        State["Farmer Context & Local Cache"]
        AuthClient["Auth Client (JWT / Firebase Phone)"]
    end

    subgraph Hosting["Cloud Hosting & CDN"]
        Vercel["Vercel Edge Network (HTTPS)"]
    end

    subgraph BackendServices["Backend Services (FastAPI / Python 3.14)"]
        API["FastAPI REST API (Uvicorn)"]
        AuthModule["Argon2id Hashing & JWT Auth"]
        DataEngine["SQLAlchemy 2.0 ORM"]
    end

    subgraph Persistence["Cloud Persistence Layer"]
        NeonDB[("Neon Serverless PostgreSQL 18")]
        Tables["users & farmer_profiles (ecosystem_data)"]
    end

    UI --> State
    State --> AuthClient
    AuthClient --> Vercel
    Vercel --> API
    API --> AuthModule
    API --> DataEngine
    DataEngine --> NeonDB
    NeonDB --- Tables
```

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16.3.8 (App Router), React 19, TypeScript | Server and client rendered UI, responsive layout |
| **Styling & Design** | Tailwind CSS, Lucide React, Framer Motion | Agricultural green-themed mobile UI, accessible on all screen widths |
| **State & Offline Sync** | React Context API, LocalStorage cache | Offline-first availability for rural regions |
| **Backend API** | FastAPI (Python), Uvicorn ASGI Server | High-performance asynchronous REST API |
| **Authentication** | Argon2id password hashing, PyJWT signed tokens | Secure, independent zero-cost authentication |
| **Database ORM** | SQLAlchemy 2.0, Psycopg 3 binary driver | Scalable schema modeling and connection pooling |
| **Cloud Database** | Neon Serverless PostgreSQL 18 (AWS Ohio) | Fully persistent relational and serialized JSON storage |
| **Hosting & CI/CD** | Vercel (Frontend), Render (Backend) | Automatic HTTPS, global CDN, and zero-downtime deployment |

---

## 4. Database Schema Design

The persistence architecture uses a relational foundation paired with flexible schema support for dynamic agricultural records:

```mermaid
erDiagram
    USERS ||--|| FARMER_PROFILES : owns
    USERS {
        string id PK "usr-uuid"
        string email UK "farmer@kshetraone.org"
        string full_name "Farmer Full Name"
        string password_hash "Argon2id hash"
        datetime created_at "Timestamp"
    }
    FARMER_PROFILES {
        string id PK "farmer-uuid"
        string user_id FK "References users.id"
        string name "Farmer Name"
        string phone_number "Mobile number (+91)"
        string state "State (e.g. Karnataka)"
        string district "District (e.g. Ballari)"
        string village "Village"
        string farm_type "crop | dairy | mixed"
        float land_area_acres "Total acres"
        int cattle_count "Total livestock"
        string language "Language code (en, kn, hi, te, ta)"
        boolean onboarded "True if setup complete"
        text ecosystem_data "Serialized JSON (Plots, Crops, Cattle, Ledger, Warehouse, Market)"
        datetime updated_at "Last synchronized"
    }
```

---

## 5. Security & ₹0 Budget Architecture

1. **Password Protection**: Raw passwords are never stored in plaintext. They are hashed using **Argon2id** (`m=65536, t=3, p=4`).
2. **Stateless JWT Authorization**: API requests use standard Bearer token authentication signed via HMAC SHA-256.
3. **₹0 Cost Protection**: 
   - No paid third-party SMS or email APIs.
   - Built on free-tier serverless PostgreSQL (Neon) and container services (Render & Vercel).
