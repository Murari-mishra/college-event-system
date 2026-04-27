# 🎓 EduEvent — College Event Management System

A full-stack MERN application for managing college events with role-based authentication for Admins and Students.

---

## 🗂️ Project Structure

```
college-event-system/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe
│   │   ├── eventController.js       # CRUD for events
│   │   └── registrationController.js# Registration logic
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── roleMiddleware.js        # Role-based access
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Event.js                 # Event schema
│   │   └── Registration.js         # Registration schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── registrationRoutes.js
│   ├── .env.example
│   ├── seed.js                      # Sample data seeder
│   ├── server.js                    # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── EventCard.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── RegisterPage.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── CreateEventPage.jsx
    │   │   │   ├── ManageEventsPage.jsx
    │   │   │   └── ViewParticipantsPage.jsx
    │   │   ├── student/
    │   │   │   ├── StudentDashboard.jsx
    │   │   │   ├── EventListPage.jsx
    │   │   │   └── MyRegistrationsPage.jsx
    │   │   └── HomePage.jsx
    │   ├── services/
    │   │   ├── api.js               # Axios instance
    │   │   ├── authService.js
    │   │   ├── eventService.js
    │   │   └── registrationService.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** v9+

---

## 🚀 Setup Instructions

### 1. Clone / Extract the project

```bash
cd college-event-system
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventdb
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

> **MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string.

```bash
# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The backend will run at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will run at: **http://localhost:5173**

---

## 🔐 Demo Login Credentials

After running `npm run seed` in the backend:

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@college.edu      | admin123   |
| Student | student@college.edu    | student123 |

---

## 📡 API Reference

### Auth
| Method | Endpoint             | Access  | Description         |
|--------|----------------------|---------|---------------------|
| POST   | /api/auth/register   | Public  | Register new user   |
| POST   | /api/auth/login      | Public  | Login               |
| GET    | /api/auth/me         | Private | Get current user    |

### Events
| Method | Endpoint           | Access  | Description         |
|--------|--------------------|---------|---------------------|
| GET    | /api/events        | Private | Get all events      |
| GET    | /api/events/:id    | Private | Get single event    |
| POST   | /api/events        | Admin   | Create event        |
| PUT    | /api/events/:id    | Admin   | Update event        |
| DELETE | /api/events/:id    | Admin   | Delete event        |

### Registrations
| Method | Endpoint                     | Access  | Description                  |
|--------|------------------------------|---------|------------------------------|
| POST   | /api/registrations           | Student | Register for event           |
| DELETE | /api/registrations/:id       | Student | Cancel registration          |
| GET    | /api/registrations/my        | Student | My registrations             |
| GET    | /api/registrations/event/:id | Admin   | Event participants           |
| GET    | /api/registrations/all       | Admin   | All registrations (stats)    |

---

## 🧰 Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios, React Router v6 |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB, Mongoose                 |
| Auth      | JWT, bcryptjs                     |

---

## ✨ Features

### Admin
- Dashboard with live stats and recent registrations
- Create, edit, delete events
- View participants per event with search

### Student
- Personalized dashboard with upcoming events
- Browse and filter events (by name, category, time)
- Register/cancel event registrations
- My Registrations page with upcoming/past split

---

## 🏗️ Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
NODE_ENV=production npm start
```
