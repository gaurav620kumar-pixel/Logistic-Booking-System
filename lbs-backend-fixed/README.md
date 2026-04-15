# LBS Backend – MongoDB Edition

Logistic Booking System backend migrated from lowdb (JSON file) to **MongoDB + Mongoose**.  
All existing API routes, response shapes, and JWT auth are **100% compatible** with the React frontend.

---

## Folder structure

```
lbs-backend-mongodb/
├── server.js                       ← Entry point
├── seed.js                         ← One-time DB seeder
├── package.json
├── .env.example                    ← Copy to .env and fill in
└── src/
    ├── db/
    │   └── mongoose.js             ← MongoDB connection
    ├── middleware/
    │   └── auth.js                 ← JWT auth middleware
    ├── models/
    │   ├── User.js
    │   ├── Venue.js
    │   ├── TimeSlot.js
    │   ├── Booking.js
    │   ├── Notification.js
    │   ├── EquipmentRequest.js
    │   └── CompromiseRequest.js
    └── routes/
        ├── auth.js
        ├── users.js
        ├── venues.js
        ├── bookings.js
        ├── notifications.js
        ├── equipmentRequests.js
        ├── compromiseRequests.js
        └── timeSlots.js
```

---

## Quick start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set MONGO_URI to your MongoDB connection string
```

**Local MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/lbs_db
```

**MongoDB Atlas (cloud – recommended for production):**
1. Create a free cluster at https://cloud.mongodb.com
2. Add your IP to the Network Access allowlist
3. Create a DB user
4. Copy the connection string, e.g.:
```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/lbs_db
```

### 3. Seed the database (run once)
```bash
npm run seed
```
This inserts all users, venues, time slots, bookings, notifications, equipment requests and compromise requests.

### 4. Start the server
```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

---

## Default credentials

All accounts share the same password: **`college@123`**

| Role    | Email                  |
|---------|------------------------|
| Admin   | meena@college.edu      |
| Faculty | priya@college.edu      |
| Faculty | rahul@college.edu      |
| Faculty | anita@college.edu      |
| Faculty | karan@college.edu      |
| Staff   | rajesh@college.edu     |
| Staff   | suresh@college.edu     |

---

## API Reference

| Method | Endpoint                           | Auth | Description                          |
|--------|------------------------------------|------|--------------------------------------|
| POST   | /api/auth/login                    | ✗    | Login, returns JWT token             |
| GET    | /api/auth/me                       | ✓    | Get current user                     |
| GET    | /api/users                         | ✓    | List users (admin: all)              |
| POST   | /api/users                         | ✓    | Create user (admin only)             |
| PUT    | /api/users/:id                     | ✓    | Update user (admin only)             |
| DELETE | /api/users/:id                     | ✓    | Delete user (admin only)             |
| GET    | /api/venues                        | ✓    | List venues                          |
| POST   | /api/venues                        | ✓    | Create venue                         |
| PUT    | /api/venues/:id                    | ✓    | Update venue                         |
| DELETE | /api/venues/:id                    | ✓    | Delete venue                         |
| GET    | /api/timeslots                     | ✓    | List time slots                      |
| GET    | /api/bookings                      | ✓    | List bookings (role-scoped)          |
| POST   | /api/bookings                      | ✓    | Create booking                       |
| GET    | /api/bookings/check-conflict       | ✓    | Check slot availability              |
| PUT    | /api/bookings/:id/approve          | ✓    | Approve booking (admin)              |
| PUT    | /api/bookings/:id/reject           | ✓    | Reject booking (admin)               |
| GET    | /api/notifications                 | ✓    | List notifications (user-scoped)     |
| PUT    | /api/notifications/:id/read        | ✓    | Mark notification as read            |
| PUT    | /api/notifications/mark-all-read   | ✓    | Mark all as read                     |
| GET    | /api/equipment-requests            | ✓    | List equipment requests (role-scoped)|
| POST   | /api/equipment-requests            | ✓    | Create equipment request             |
| PUT    | /api/equipment-requests/:id        | ✓    | Update equipment request status      |
| GET    | /api/compromise-requests           | ✓    | List compromise requests (scoped)    |
| POST   | /api/compromise-requests           | ✓    | Create compromise request            |
| PUT    | /api/compromise-requests/:id       | ✓    | Accept or decline compromise request |
| GET    | /api/health                        | ✗    | Health check                         |

---

## MongoDB collections

| Collection          | Description                                    |
|---------------------|------------------------------------------------|
| `users`             | Faculty, staff and admin accounts              |
| `venues`            | Classrooms, labs, halls and auditoriums        |
| `timeslots`         | 9 fixed hourly slots (8 AM – 5 PM)            |
| `bookings`          | Venue booking requests (pending/approved/etc.) |
| `notifications`     | Per-user notifications                         |
| `equipmentrequests` | Equipment setup requests from faculty to staff |
| `compromisequests`  | Faculty-to-faculty venue swap requests         |

---

## Notes

- The `id` field on every document is kept as a short string (e.g. `f1`, `v3`, `b1`) instead of MongoDB's default `_id` ObjectId. This ensures **zero changes are required** in the frontend code.
- All routes and response shapes are identical to the original lowdb version.
- Passwords are bcrypt-hashed; plain text passwords are never stored.
