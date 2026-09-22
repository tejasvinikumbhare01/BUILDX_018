# ResQGrid Backend – Emergency Telemetry & Dispatch API

Node.js, Express, PostgreSQL, and Socket.IO server powering real-time civil defense coordination and responder dispatch.

## Tech Stack
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-Time Communication**: Socket.IO (WebSocket)
- **Security**: JWT authentication, bcryptjs, Helmet, CORS
- **Geospatial**: Reverse geocoding via OpenStreetMap Nominatim, Haversine proximity calculations

## Directory Layout
```
backend/
├── prisma/
│   ├── schema.prisma       # Database models (Users, Incidents, Rescues, Shelters, Hospitals, Alerts)
│   └── seed.ts             # Pre-seeded Nagpur operational data
└── src/
    ├── config/             # Environment variables & constants
    ├── db/                 # Prisma client instance & DB connectors
    ├── middleware/         # Auth verification & multer upload
    ├── routes/             # Express API route modules
    ├── services/           # Proximity & responder allocation algorithms
    ├── sockets/            # Real-time WebSocket event broadcaster
    ├── utils/              # Haversine distance, priority calculator, ID generators
    └── server.ts           # Express & Socket.IO server entrypoint
```

## Setup & Running
```bash
# Install dependencies
npm install

# Push Prisma schema to DB & generate client
npm run prisma:generate
npm run prisma:push

# Seed Nagpur live operational data
npm run prisma:seed

# Start backend server
npm run dev
```
Default Server Port: `http://localhost:5000`
