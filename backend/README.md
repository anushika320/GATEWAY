# GATEWAY Backend

Backend API for the Security Gate Pass Management System.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 👥 **User Management** - Create, list, and delete users (admin/officer roles)
- 🚗 **Gate Pass Management** - Create and manage gate passes
- 📧 **Email Notifications** - Automatic credential emails via nodemailer

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer

## Project Structure

```
backend/
├── controllers/         # Business logic
│   ├── gatepassController.js
│   └── userController.js
├── middleware/          # Express middleware
│   └── auth.js          # JWT authentication & role-based access
├── models/              # Mongoose schemas
│   ├── GatePass.js
│   └── User.js          # With bcrypt password hashing
├── routes/              # API route definitions
│   ├── gatePassRoute.js
│   └── userRoutes.js
├── .env                 # Environment variables (not in repo)
├── package.json
└── server.js            # Entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   MAIL_HOST=smtp.example.com
   MAIL_PORT=587
   MAIL_USER=your_email
   MAIL_PASS=your_password
   ```

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/users/login` - Login with username/password

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/dashboard` - Admin dashboard data

### Officer
- `GET /api/users/officer/dashboard` - Officer dashboard

### Gate Passes
- `GET /api/gatepasses` - List all gate passes
- `POST /api/gatepasses` - Create gate pass
- `PUT /api/gatepasses/:id` - Update gate pass
- `DELETE /api/gatepasses/:id` - Delete gate pass

## Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token authentication (8-hour expiry)
- ✅ Role-based access control (admin/officer)
- ✅ Password field excluded from queries by default
- ✅ Input validation on all endpoints

## Contributing

Contributed by: **anushika32**
