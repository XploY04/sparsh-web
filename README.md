# Clinical Trials Admin Portal

A secure Next.js-based admin portal for managing clinical trials.

## Features

- **Authentication**: Secure login with Next-Auth and bcrypt password hashing
- **User Management**: Role-based access (admin/user)
- **Trial Management**: Create, view, and manage clinical trials
- **Multi-step Wizard**: Intuitive trial setup process
- **Protected Routes**: Middleware-based route protection

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose
- **Authentication**: Next-Auth.js
- **Styling**: Tailwind CSS
- **Security**: bcryptjs for password hashing

## Setup Instructions

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Update `.env.local` with your MongoDB URI and NextAuth secret:

   ```
   MONGODB_URI=your-mongodb-connection-string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

3. **Start MongoDB**:
   Make sure MongoDB is running locally or update the URI for your cloud instance.

4. **Create First Admin User**:

   ```bash
   # Generate admin credentials
   node scripts/createAdmin.js

   # Then register via API:
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123","role":"admin"}'
   ```

5. **Start Development Server**:

   ```bash
   npm run dev
   ```

6. **Access the Application**:
   - Open http://localhost:3001 in your browser (or whatever port Next.js assigns)
   - Login with your admin credentials
   - Start creating trials!

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # Next-Auth configuration
│   │   ├── register/               # User registration
│   │   └── trials/                 # Trial CRUD operations
│   ├── dashboard/                  # Protected dashboard pages
│   │   └── trials/new/             # Trial creation wizard
│   ├── login/                      # Login page
│   └── layout.js                   # Root layout with sidebar
├── models/
│   ├── User.js                     # User schema
│   └── Trial.js                    # Trial schema
├── lib/
│   └── dbConnect.js                # MongoDB connection
└── middleware.js                   # Route protection
```

## Success Criteria (Stage 1) ✅

- [x] User can log in with email/password
- [x] Protected dashboard routes redirect unauthenticated users
- [x] Admin can access dashboard and see "Create New Trial" button
- [x] Admin can fill out multi-step Trial Setup Wizard
- [x] New trials are created in database and appear in trial list
- [x] Secure password hashing with bcrypt
- [x] Session management with Next-Auth

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/auth/signin` - Login (handled by Next-Auth)
- `GET /api/trials` - List all trials (protected)
- `POST /api/trials` - Create new trial (protected)

## Next Steps

Consider implementing:

- Trial editing and deletion
- Participant management
- Data collection forms
- Reporting and analytics
- Email notifications
- Audit logging
