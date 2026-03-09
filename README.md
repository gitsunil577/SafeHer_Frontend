# SafeHer — Women Assistance System

A full-stack real-time emergency response platform that connects women in distress with nearby verified volunteers, tracks live location during incidents, and coordinates rapid assistance through a role-based web application.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Socket.IO Events](#socketio-events)
- [Frontend Architecture](#frontend-architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [Alert Lifecycle](#alert-lifecycle)
- [Scripts](#scripts)
- [Security](#security)
- [Future Enhancements](#future-enhancements)

---

## Overview

SafeHer is a women's safety web platform built around real-time emergency response. When a user triggers an SOS alert, the system instantly identifies on-duty volunteers within a 5 km radius, notifies them via WebSocket, shares the user's live location, and tracks the complete response until resolution — all without page refreshes or manual polling.

The platform is designed for three audiences:
- **Women (users)** who need fast, one-tap access to emergency help
- **Volunteers** who are verified, on-duty responders ready to assist
- **Admins** who manage users, volunteers, safe zones, and review system reports

---

## Problem Statement

Women frequently encounter unsafe situations while commuting, working late, or living alone. Existing solutions suffer from:

- Delayed access to emergency assistance
- No real-time coordination between users and responders
- Dependence on manual phone calls under stress
- No centralized tracking of incidents or response quality
- Limited visibility into nearby support resources

SafeHer addresses these gaps with a structured, real-time, geo-aware response system.

---

## Features

### For Users (Women)
- One-tap SOS alert with automatic live location sharing
- Real-time volunteer response tracking on an interactive map
- Emergency contact management (up to 5 contacts per user)
- Auto-notification to emergency contacts when an alert is created
- Complete alert history with rating and feedback submission
- Safety profile with blood group and medical conditions
- Nearby safe zones: police stations, hospitals, help desks, ATMs
- Live list of nearby on-duty volunteers with real-time status updates

### For Volunteers
- On-duty toggle to start or stop receiving alert notifications
- Real-time incoming SOS alert notifications via Socket.IO
- Accept or decline alerts; view user location on map
- Live location sharing during active response
- Performance dashboard: total assists, average response time, star rating
- Badge system: First Responder, 10/25/50 Assists, Quick Responder
- Full personal response history

### For Admins
- System-wide dashboard with key metrics
- User management: activate, deactivate accounts
- Volunteer management: verify identity, update status, filter by availability
- Full alert monitoring across all users and volunteers
- Safe zone creation, editing, and deletion
- System reports

### Platform-Wide
- JWT-based authentication with role-protected routes
- Real-time updates via Socket.IO (zero polling overhead)
- Geospatial queries using MongoDB 2dsphere indexes
- Automatic alert expiry after 30 minutes of no response
- Automatic alert cleanup after 7 days (TTL index)
- Security: bcrypt password hashing, Helmet headers, CORS, input validation

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19 |
| Client-Side Routing | React Router DOM | 7 |
| Mapping | Leaflet / React-Leaflet | 1.9 / 5.0 |
| Mapping (alt) | Google Maps API (`@react-google-maps/api`) | 2.20 |
| Real-Time Client | Socket.IO Client | 4.8 |
| Backend Framework | Express | 5 |
| Runtime | Node.js | ≥ 18 |
| Database | MongoDB | — |
| ODM | Mongoose | 9 |
| Real-Time Server | Socket.IO | 4.8 |
| Authentication | JSON Web Tokens (`jsonwebtoken`) | 9 |
| Password Hashing | bcryptjs | 3 |
| Validation | express-validator | 7 |
| Security Headers | Helmet | 8 |
| HTTP Logging | Morgan | 1.10 |
| Dev Server | Nodemon | 3 |

---

## Project Structure

```
Women Assistance System/
│
├── my-app/                              # Frontend (React / CRA)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── Login.js             # User / Volunteer / Admin login
│       │   │   ├── Register.js          # Regular user registration
│       │   │   ├── VolunteerRegister.js # Volunteer-specific registration form
│       │   │   └── AuthLayout.js        # Shared auth page wrapper
│       │   │
│       │   ├── user/
│       │   │   ├── Dashboard.js         # User home: SOS button, nearby volunteers, alerts
│       │   │   ├── SafetyProfile.js     # Profile, medical info, settings
│       │   │   ├── EmergencyContacts.js # Add/edit/delete emergency contacts
│       │   │   ├── AlertHistory.js      # Past alerts with details & feedback
│       │   │   ├── NearbySupport.js     # Live map of nearby on-duty volunteers
│       │   │   ├── SOSButton.js         # SOS trigger component
│       │   │   └── FeedbackBanner.js    # Post-alert feedback prompt
│       │   │
│       │   ├── volunteer/
│       │   │   ├── VolunteerDashboard.js    # Stats, duty toggle, badges
│       │   │   ├── AlertNotifications.js    # Incoming alerts: accept / decline
│       │   │   └── VolunteerProfile.js      # Profile & verification status
│       │   │
│       │   ├── admin/
│       │   │   ├── AdminDashboard.js        # System-wide metrics
│       │   │   ├── UserManagement.js        # User list, activate/deactivate
│       │   │   ├── VolunteerManagement.js   # Volunteer verification & status
│       │   │   ├── AlertMonitoring.js       # All alerts across the system
│       │   │   ├── Reports.js               # Generate system reports
│       │   │   └── SafeZoneManagement.js    # CRUD for safe zones
│       │   │
│       │   └── common/
│       │       ├── Navbar.js            # Role-aware navigation header
│       │       ├── Footer.js
│       │       ├── Modal.js             # Reusable modal dialog
│       │       ├── GoogleMap.js         # Google Maps integration component
│       │       ├── Chatbot.js           # In-app chat support
│       │       └── NavigationLoader.js  # Page transition loader
│       │
│       ├── context/
│       │   ├── AuthContext.js           # Global auth state (user, login, logout, register)
│       │   └── SocketContext.js         # Socket.IO connection & event management
│       │
│       ├── services/
│       │   └── api.js                   # Centralized Axios/fetch HTTP client
│       │
│       ├── pages/
│       │   └── Home.js                  # Public landing page
│       │
│       ├── App.js                       # Router, protected routes, layout
│       └── index.js                     # React entry point
│
└── SafeHer_Backend/                     # Backend (Node.js / Express)
    ├── config/
    │   ├── config.js                    # Centralized app configuration constants
    │   └── database.js                  # MongoDB connection setup
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── volunteerController.js
    │   ├── alertController.js
    │   ├── contactController.js
    │   └── adminController.js
    │
    ├── middleware/
    │   ├── auth.js                      # JWT verification & role guards
    │   ├── errorHandler.js              # Global error handler
    │   └── validate.js                  # Request validation middleware
    │
    ├── models/
    │   ├── User.js
    │   ├── Volunteer.js
    │   ├── Alert.js
    │   ├── EmergencyContact.js
    │   └── SafeZone.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── volunteerRoutes.js
    │   ├── alertRoutes.js
    │   ├── contactRoutes.js
    │   ├── safeZoneRoutes.js
    │   └── adminRoutes.js
    │
    ├── utils/
    │   ├── logger.js
    │   ├── helpers.js
    │   └── seeder.js                    # Database seeder script
    │
    ├── server.js                        # Entry point: Express + Socket.IO + scheduled tasks
    ├── package.json
    └── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local instance or MongoDB Atlas)
- npm

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Women Assistance System"
```

### 2. Set up the backend

```bash
cd SafeHer_Backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and other values
npm install
npm run dev
```

Backend starts on `http://localhost:5000`.

### 3. Set up the frontend

```bash
cd my-app
# Create .env with the values shown in the Environment Variables section
npm install
npm start
```

Frontend starts on `http://localhost:3000`.

### 4. Seed the database (optional)

```bash
cd SafeHer_Backend
npm run seed
```

---

## Environment Variables

### Backend — `SafeHer_Backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/women_safety_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Frontend URL (used for CORS)
CLIENT_URL=http://localhost:3000

# SMS notifications (optional)
FAST2SMS_API_KEY=your_fast2sms_api_key
```

### Frontend — `my-app/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require:

```
Authorization: Bearer <jwt_token>
```

---

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register a new user | No |
| POST | `/register/volunteer` | Register as a volunteer | No |
| POST | `/login` | Login (all roles) | No |
| POST | `/logout` | Logout | Yes |
| GET | `/me` | Get current authenticated user | Yes |
| PUT | `/updatedetails` | Update name, email, phone, address | Yes |
| PUT | `/updatepassword` | Change password | Yes |
| PUT | `/location` | Update user's last known location | Yes |

---

### Users — `/api/users`

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/profile` | Get full user profile | user |
| PUT | `/profile` | Update profile (medical info, blood group, etc.) | user |
| GET | `/alerts` | Get user's alert history | user |
| GET | `/dashboard` | Dashboard stats (active alert, nearby volunteers, etc.) | user |
| GET | `/settings` | Get app settings | user |
| PUT | `/settings` | Update settings (autoShareLocation, silentMode, etc.) | user |

---

### Volunteers — `/api/volunteers`

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/nearby` | Get nearby on-duty volunteers (requires user location) | user |
| GET | `/list` | Get all volunteers | Any |
| GET | `/profile` | Get volunteer's own profile | volunteer |
| PUT | `/profile` | Update volunteer profile | volunteer |
| PUT | `/duty` | Toggle on-duty / off-duty status | volunteer |
| PUT | `/location` | Update volunteer's current location | volunteer |
| GET | `/dashboard` | Volunteer stats, badges, active alert | volunteer |
| GET | `/history` | Full response history | volunteer |
| GET | `/badges` | Earned badges list | volunteer |

---

### Alerts — `/api/alerts`

| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/` | Create a new SOS alert | user |
| GET | `/my` | Get all of the user's alerts | user |
| GET | `/active` | Get user's currently active alert | user |
| GET | `/pending-feedback` | Get resolved alerts awaiting feedback | user |
| GET | `/nearby/active` | Get nearby active alerts | volunteer |
| GET | `/recent` | Get recent alerts | Any |
| GET | `/:id` | Get full alert details | Yes |
| PUT | `/:id/location` | Update live location during active alert | user |
| PUT | `/:id/cancel` | Cancel an active alert | user |
| PUT | `/:id/resolve` | Mark alert as resolved | user / volunteer / admin |
| PUT | `/:id/feedback` | Submit feedback and star rating | user |
| PUT | `/:id/accept` | Accept an incoming alert | volunteer |
| PUT | `/:id/decline` | Decline an incoming alert | volunteer |

---

### Emergency Contacts — `/api/contacts`

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/` | Get all contacts | user |
| POST | `/` | Add a new emergency contact | user |
| GET | `/:id` | Get a specific contact | user |
| PUT | `/:id` | Update a contact | user |
| DELETE | `/:id` | Delete a contact | user |
| PUT | `/:id/primary` | Set contact as primary | user |

Maximum 5 contacts per user.

---

### Safe Zones — `/api/safezones`

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/` | Get all safe zones (filter by type) | Any |
| GET | `/nearby` | Get nearby safe zones with distance | Any |
| GET | `/:id` | Get specific safe zone details | Any |

---

### Admin — `/api/admin`

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/dashboard` | System-wide metrics | admin |
| GET | `/users` | All users (paginated, searchable) | admin |
| PUT | `/users/:id/status` | Activate or deactivate a user | admin |
| GET | `/volunteers` | All volunteers (filterable by status) | admin |
| PUT | `/volunteers/:id/verify` | Verify a volunteer's identity | admin |
| PUT | `/volunteers/:id/status` | Update volunteer status | admin |
| GET | `/alerts` | All system alerts | admin |
| GET | `/reports` | System reports | admin |
| GET | `/safezones` | All safe zones | admin |
| POST | `/safezones` | Create a new safe zone | admin |
| PUT | `/safezones/:id` | Update a safe zone | admin |
| DELETE | `/safezones/:id` | Delete a safe zone | admin |

---

### Health Check

```
GET /api/health
```

Returns server status and uptime. Useful for deployment monitoring.

---

## Database Models

### User

| Field | Type | Details |
|---|---|---|
| `name` | String | Required |
| `email` | String | Unique, required |
| `phone` | String | Required |
| `password` | String | Hashed with bcrypt |
| `role` | Enum | `user`, `volunteer`, `admin` — default: `user` |
| `address` | Object | street, city, state, pincode, fullAddress |
| `bloodGroup` | Enum | A+, A-, B+, B-, AB+, AB-, O+, O- |
| `medicalConditions` | String | Free text |
| `allergies` | String | Free text |
| `emergencyMessage` | String | Default SOS message sent with alerts |
| `profileImage` | String | URL |
| `isActive` | Boolean | Default: `true` |
| `isVerified` | Boolean | Default: `false` |
| `lastLocation` | GeoJSON Point | Coordinates + updatedAt; 2dsphere indexed |
| `settings` | Object | autoShareLocation, notifyContacts, silentMode, shakeToSOS |
| `createdAt` / `updatedAt` | Date | Auto-managed timestamps |

**Methods:** `getSignedJwtToken()`, `matchPassword()`

---

### Volunteer

| Field | Type | Details |
|---|---|---|
| `user` | ObjectId (User) | Required, unique |
| `idType` | Enum | aadhar, passport, driving, voter |
| `idNumber` | String | Required |
| `idDocument` | String | URL of uploaded document |
| `occupation` | String | |
| `organization` | String | |
| `skills` | Array | |
| `availability` | Enum | fulltime, daytime, nighttime, weekends, flexible |
| `isVerified` | Boolean | Set by admin — default: `false` |
| `verifiedAt` / `verifiedBy` | Date / ObjectId | Set when admin verifies |
| `status` | Enum | pending, active, inactive, suspended — default: `pending` |
| `isOnDuty` | Boolean | Default: `false` |
| `currentLocation` | GeoJSON Point | 2dsphere indexed |
| `stats` | Object | totalResponses, successfulAssists, declinedAlerts, avgResponseTime, rating, totalRatings |
| `badges` | Array | name, icon, earnedAt |
| `responseHistory` | Array | Per-alert response record |

**Methods:** `updateStats()`, `checkBadges()`

**Badge Criteria:** First Responder (1st assist), 10 Assists, 25 Assists, 50 Assists, Quick Responder (avg response < 5 min)

---

### Alert

| Field | Type | Details |
|---|---|---|
| `user` | ObjectId (User) | Alert creator |
| `location` | GeoJSON Point | address, landmark, updatedAt |
| `locationHistory` | Array | All location updates |
| `liveLocationEnabled` | Boolean | Default: `false` |
| `status` | Enum | pending, active, responding, resolved, cancelled, expired |
| `priority` | Enum | low, medium, high, critical — default: `high` |
| `type` | Enum | sos, medical, accident, harassment, other |
| `message` | String | Custom alert message |
| `audioRecording` / `images` | String / Array | URLs |
| `notifiedVolunteers` | Array | Volunteer ref, notification status, distance |
| `respondingVolunteer` | Object | volunteer, acceptedAt, arrivedAt, distance |
| `notifiedContacts` | Array | Emergency contacts + notification status |
| `timeline` | Array | Full audit trail of all actions |
| `resolution` | Object | resolvedBy, resolvedAt, notes, rating, feedback |
| `responseTime` | Number | Seconds from creation to first acceptance |
| `totalDuration` | Number | Seconds from creation to resolution |
| `expiresAt` | Date | Default: 30 minutes from creation |
| `createdAt` / `updatedAt` | Date | Auto-managed |

**Indexes:** 2dsphere on `location`, compound on `status + createdAt`, TTL (7-day auto-delete)

**Methods:** `addTimelineEntry()`, `calculateResponseTime()`, `calculateTotalDuration()`

---

### EmergencyContact

| Field | Type | Details |
|---|---|---|
| `user` | ObjectId (User) | Owner |
| `name` | String | Required |
| `phone` | String | Required |
| `email` | String | Optional |
| `relation` | Enum | Mother, Father, Spouse, Sibling, Friend, Colleague, Other |
| `isPrimary` | Boolean | Only one primary per user |
| `notificationPreferences` | Object | sms, call, email (booleans) |
| `isActive` | Boolean | Default: `true` |

**Validation:** Max 5 contacts per user enforced at model level.

---

### SafeZone

| Field | Type | Details |
|---|---|---|
| `name` | String | Required |
| `type` | Enum | police, hospital, helpdesk, transport, public, atm, other |
| `location` | GeoJSON Point | With address; 2dsphere indexed |
| `phone` | String | Contact number |
| `operatingHours` | Object | is24Hours, openTime, closeTime, days |
| `services` | Array | List of services offered |
| `isVerified` | Boolean | Admin-verified — default: `false` |
| `isActive` | Boolean | Default: `true` |
| `addedBy` | ObjectId (User) | Creator reference |
| `ratings` | Object | average, count |

---

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join` | `{ userId }` | User joins their personal Socket.IO room |
| `join_volunteer` | `{ volunteerId }` | Volunteer joins their personal room |
| `location_update` | `{ alertId, latitude, longitude }` | User's live location during active alert |
| `volunteer_status` | `{ volunteerId, isOnDuty }` | Broadcast duty status change |
| `volunteer_location_update` | `{ volunteerId, latitude, longitude }` | Volunteer's live location while on duty |

### Server → Client

| Event | Description | Sent To |
|---|---|---|
| `new_alert` | New SOS alert created nearby | Nearby on-duty volunteers |
| `volunteer_responding` | A volunteer accepted the user's alert | Alert owner (user) |
| `alert_cancelled` | User cancelled the alert | Responding volunteer |
| `volunteer_status_update` | Volunteer went on/off duty | All connected clients |
| `volunteer_moved` | Volunteer location changed | All connected clients |
| `alert_{id}_location` | User live location update | Responding volunteer |

---

## Frontend Architecture

### Context Providers

**`AuthContext`** — Global authentication state
- Stores `user` object and `loading` boolean
- Persists JWT token and user object in `localStorage`
- Validates token on app mount (`/api/auth/me`)
- Exposes: `login()`, `logout()`, `register()`, `registerVolunteer()`, `updateUser()`

**`SocketContext`** — Real-time WebSocket management
- Auto-connects when a user logs in; disconnects on logout
- Auto-joins the correct Socket.IO room based on role
- Reconnects automatically (up to 10 attempts, 1s delay between)
- Exposes: `on(event, handler)`, `off(event, handler)`, `emit(event, data)`, `isConnected`

### Route Protection

- **`ProtectedRoute`** — Redirects unauthenticated users to `/login`; enforces role-based access
- **`PublicRoute`** — Redirects already-authenticated users to their role's dashboard

### Route Map

| Path | Component | Role Required |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/volunteer/register` | VolunteerRegister | Public |
| `/dashboard` | Dashboard | user |
| `/profile` | SafetyProfile | user |
| `/contacts` | EmergencyContacts | user |
| `/history` | AlertHistory | user |
| `/volunteer/dashboard` | VolunteerDashboard | volunteer |
| `/volunteer/alerts` | AlertNotifications | volunteer |
| `/volunteer/profile` | VolunteerProfile | volunteer |
| `/admin/dashboard` | AdminDashboard | admin |
| `/admin/users` | UserManagement | admin |
| `/admin/volunteers` | VolunteerManagement | admin |
| `/admin/alerts` | AlertMonitoring | admin |
| `/admin/reports` | Reports | admin |
| `/admin/safezones` | SafeZoneManagement | admin |

---

## User Roles & Permissions

| Action | User | Volunteer | Admin |
|---|---|---|---|
| Create SOS alert | Yes | No | No |
| Cancel own alert | Yes | No | No |
| Resolve alert | Yes | Yes (assigned) | Yes |
| Accept / Decline alert | No | Yes | No |
| Toggle on-duty | No | Yes | No |
| Share live location during alert | Yes | Yes | No |
| Manage emergency contacts | Yes | No | No |
| View safe zones | Yes | Yes | Yes |
| Create / Edit / Delete safe zones | No | No | Yes |
| View all users | No | No | Yes |
| Activate / Deactivate users | No | No | Yes |
| Verify volunteers | No | No | Yes |
| View system reports | No | No | Yes |

---

## Alert Lifecycle

```
User triggers SOS
        |
        v
Alert created (status: pending)
Nearby on-duty volunteers notified via Socket.IO
(search radius: 5 km, max 10 volunteers)
        |
        ├── No response in 30 minutes → status: expired (auto)
        |
        v
Volunteer accepts alert (status: responding)
  - User receives real-time "volunteer_responding" event
  - Volunteer's live location shared via socket
        |
        v
Volunteer arrives / situation resolved
User or volunteer marks alert resolved (status: resolved)
  - Alert timeline finalized
  - responseTime and totalDuration calculated
        |
        v
User submits feedback (rating + notes)
Volunteer stats and badges updated

--- Other paths ---

User cancels alert → status: cancelled
  Volunteer notified via "alert_cancelled" socket event

All alerts auto-deleted after 7 days (MongoDB TTL index)
```

---

## Scripts

### Backend (`SafeHer_Backend/`)

```bash
npm run dev     # Start with nodemon (auto-restart on changes)
npm start       # Start in production mode
npm run seed    # Seed the database with sample data
```

### Frontend (`my-app/`)

```bash
npm start       # Start development server on port 3000
npm run build   # Create optimized production build
npm test        # Run tests
```

---

## Security

| Measure | Implementation |
|---|---|
| Password hashing | bcryptjs (salted, adaptive rounds) |
| Authentication | JWT Bearer tokens (7-day expiry) |
| Authorization | Role-based middleware on every protected route |
| Security headers | Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | Restricted to configured `CLIENT_URL` |
| Input validation | express-validator on all mutation endpoints |
| Injection protection | Mongoose schema-enforced types |
| Data hygiene | Automatic expiry and TTL cleanup of old alerts |

---

## Backend Configuration Constants (`config/config.js`)

| Setting | Default |
|---|---|
| Alert search radius | 5 km |
| Max volunteers notified per alert | 10 |
| Alert auto-expiry | 30 minutes |
| Alert data retention | 7 days |
| Alert cleanup schedule | On startup + every 6 hours |

---

## Future Enhancements

- Native mobile app (React Native) with background SOS widget
- Shake-to-SOS gesture support
- Voice-activated alert triggering
- Direct integration with police and ambulance services
- AI-based route risk detection and prediction
- Wearable / IoT device support
- Push notifications (PWA / Firebase)
- Multi-language support

---

## License

This project is built for educational and humanitarian purposes. All rights reserved.
