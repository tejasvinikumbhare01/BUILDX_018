# 🛡️ ResQGrid AI – Intelligent Disaster Management & Urban Resilience Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)

> **Track:** Disaster Management & Urban Resilience  
> **Deployment Hub:** Nagpur Civil Defense Operational Sector (Maharashtra, India)

ResQGrid AI is a comprehensive, production-grade disaster response platform engineered to unify civil defense authorities, first responders, and citizens during acute urban crises. Featuring real-time GPS telemetry, reverse-geocoded physical addresses, automated responder dispatch, live CCTV flood monitoring, and AI-powered damage assessment.

---

## 🏛️ System Architecture

```
                                  +---------------------------+
                                  |     React + TypeScript    |
                                  |   (Vite Frontend - :5173) |
                                  +-------------+-------------+
                                                |
                              REST API (JSON)   |   WebSocket (Socket.IO)
                                                v
                                  +---------------------------+
                                  |     Express + Node.js     |
                                  |   (Backend Core - :5000)  |
                                  +------+--------------+-----+
                                         |              |
                    ORM Queries (Prisma) |              | ML Inference HTTP
                                         v              v
               +---------------------------+    +---------------------------+
               |      PostgreSQL DB        |    |      FastAPI AI Engine    |
               |  (Civil Defense Registry) |    |   (Risk Modeling - :8000) |
               +---------------------------+    +---------------------------+
```

---

## 📂 Project Directory Structure

```
Disaster/
├── 📁 frontend/                     # React 18 + TypeScript + Tailwind CSS Frontend
│   ├── 📁 src/
│   │   ├── 📁 assets/               # Branding icons, images, hero assets
│   │   ├── 📁 components/           # Reusable UI component modules
│   │   │   ├── 📁 ai/               # AI Damage Analysis & ResQ Assistant modals
│   │   │   ├── 📁 alerts/           # Civil defense broadcast & banner alerts
│   │   │   ├── 📁 auth/             # Modal authentication dialogs
│   │   │   ├── 📁 common/           # Navigation bar & global layout chrome
│   │   │   ├── 📁 flood/            # Flood Tracker with live CCTV cameras & telemetry
│   │   │   ├── 📁 help/             # Nearby emergency resources modal
│   │   │   ├── 📁 incident/         # Incident reporting modal with location pin
│   │   │   ├── 📁 location/         # Live GPS coordinate & physical address card
│   │   │   ├── 📁 map/              # Leaflet GIS interactive operational map
│   │   │   ├── 📁 rescue/           # Emergency SOS rescue dispatch requester
│   │   │   ├── 📁 routing/          # Safe evacuation routing with hazard evasion
│   │   │   └── 📁 weather/          # Real-time Nagpur meteorological widget
│   │   ├── 📁 hooks/                # Custom React hooks (useLiveLocation)
│   │   ├── 📁 pages/                # Primary application views
│   │   │   ├── 📁 auth/             # Dedicated authentication (LoginPage, SignUpPage)
│   │   │   ├── AdminCommandCenter.tsx # Regional Director command & triage matrix
│   │   │   ├── CitizenDashboard.tsx   # Public resident interface with SOS & map
│   │   │   ├── ResponderDashboard.tsx # Field responder rescue queue & GPS routing
│   │   │   └── SheltersHospitalsPage.tsx # Emergency shelter & hospital capacities
│   │   ├── 📁 services/             # Axios API client & Socket.IO real-time manager
│   │   └── 📁 types/                # TypeScript interface definitions & data models
│   ├── index.html                   # HTML5 entrypoint with Google Fonts & Leaflet CSS
│   ├── package.json                 # Frontend dependencies and Vite configuration
│   └── vite.config.ts               # Vite bundler options
│
├── 📁 backend/                      # Node.js + Express + Prisma Backend
│   ├── 📁 prisma/
│   │   ├── schema.prisma            # PostgreSQL models (Users, Incidents, Shelters, etc.)
│   │   └── seed.ts                  # Seed script for Nagpur emergency hub
│   └── 📁 src/
│       ├── 📁 config/               # Environment configuration & JWT secrets
│       ├── 📁 db/                   # Database client instances
│       ├── 📁 middleware/           # JWT verification & Multer file uploads
│       ├── 📁 routes/               # Express REST route controllers
│       ├── 📁 services/             # Allocation & priority algorithms
│       ├── 📁 sockets/              # Socket.IO event emitters and rooms
│       ├── 📁 utils/                # Haversine distance, priority calculator
│       └── server.ts                # Application entrypoint & HTTP/WS server
│
├── 📁 ai-service/                   # Python FastAPI Machine Learning Microservice
│   ├── main.py                      # FastAPI server with damage assessment & flood models
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # AI microservice documentation
│
├── start-all.js                     # Unified orchestrator to start all 4 services
├── test-flood-and-address.js        # Automated integration test suite
├── package.json                     # Root orchestrator package scripts
└── README.md                        # Project documentation (this file)
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later
- **Python**: 3.9+ (optional for AI microservice)
- **PostgreSQL**: Running locally or via preconfigured port `5432`

### Launch the Entire Platform in One Command:
```bash
node start-all.js
```

This launches all 4 subsystems simultaneously:
- 🌐 **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Express Backend**: [http://localhost:5000](http://localhost:5000)
- 🧠 **FastAPI AI Service**: [http://localhost:8000](http://localhost:8000)
- 🗄️ **PostgreSQL**: Port `5432`

---

## 🔑 Pre-Seeded Judge / Demo Accounts

The platform includes 3 pre-seeded role accounts for evaluation. Each can be filled with a single click on the login screen:

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **👤 Citizen** | `citizen@resqgrid.org` | `ResQ@2026` | SOS Rescue Requests, Incident Reporting, Shelter Navigation, Flood Map |
| **🛡️ Responder** | `responder@resqgrid.org` | `ResQ@2026` | Live GPS Beacon, Assigned Rescue Triage, Casualty Status Management |
| **⚡ Admin** | `admin@resqgrid.org` | `ResQ@2026` | Regional Command Center, Incident Escalation, Emergency Broadcasts |

---

## 🌟 Key Technical Innovations

1. **Real Physical Address Reverse-Geocoding**:
   Uses the device's HTML5 Geolocation API cross-referenced against OpenStreetMap Nominatim to resolve physical street addresses (e.g. *"Shaniwari, Nagpur, Maharashtra, PIN 440002, India"*).
2. **Dynamic Flood Camera HUD**:
   Simulated CCTV feeds for key flood-prone arteries (e.g., Ambazari Dam, Sitabuldi Metro, Narendra Nagar Bridge) providing live water level telemetry and flood alerts.
3. **Automated Responder Dispatch**:
   Uses the Haversine distance formula and severity-weighted priority calculation to automatically allocate nearest available response units.
4. **ResQ Assistant (AI)**:
   Context-aware disaster chatbot and computer vision analysis for triage assessment.

---

## 🧪 Automated Test Suite
Run the full platform verification test suite:
```bash
node test-flood-and-address.js
```
*Executes 9 automated end-to-end integration tests verifying frontend availability, reverse geocoding, database connectivity, and camera feeds.*

---

## 👥 Authors
- **ResQGrid AI Team** – Built for the Disaster Management & Urban Resilience Hackathon.
