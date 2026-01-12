# Facility Desk Management System

A comprehensive Role-Based Access Control (RBAC) system for facility desk management built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure httpOnly cookies for refresh tokens
  - Token refresh and rotation mechanism
  - Password hashing with bcrypt


- **Role-Based Access Control (RBAC)**
  - Dynamic Role creation (no longer restricted to fixed Enums)
  - **13 Pre-seeded Functional Roles**:
    - Super Admin, Admin, User, Requester
    - Facility Manager, Assistant FM
    - Maintenance Supervisor, Technicians (Mech/Elec/Civil)
    - Asset Manager, HSE Officer, Energy Manager
    - Security Manager, Cleaning Manager, Front Desk, Procurement, Vendor
  - Granular permissions per resource
  - Middleware for verifying roles and permissions

- **Maintenance Management**
  - **Corrective Maintenance**: Reactive work orders for break-fix scenarios.
  - **Preventive Maintenance**: Automated scheduling based on `Preventive` templates.
  - **Scheduler**: Integrated cron jobs (node-cron) to auto-generate preventive tickets.

- **Security**
  - Helmet.js for HTTP security headers
  - CORS protection
  - Rate limiting on authentication endpoints
  - Input validation with express-validator
  - SQL injection prevention via Prisma
  - Bcrypt password hashing (12 rounds)

- **API Documentation**
  - **Swagger UI**: Interactive API documentation available at `http://localhost:3000/api/v1/docs`

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Language**: TypeScript v5.9.3
- **Database**: PostgreSQL
- **ORM**: Prisma v7.0.1
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcrypt
- **Scheduling**: node-cron

## Project Structure

```
facility-desk-server/
├── src/
│   ├── config/              # Configuration files
│   ├── errors/              # Custom error classes
│   ├── middleware/          # Express middleware (auth, rbac)
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   ├── roles/           # Role management
│   │   ├── permissions/     # Permission management
│   │   ├── maintenance/     # Maintenance logic (Services, Controllers, DTOs)
│   │   ├── cron-jobs/       # Scheduled tasks (Preventive maintenance)
│   │   └── location/        # Site/Location management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Database migrations
└── generated/prisma/        # Generated Prisma Client
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to project directory)
   ```bash
   cd facility-desk-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/facility_desk_db?schema=public"
   ```

   **Important**: Change all JWT secrets and cookie secret to strong, random values in production!

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```
   This creates all default roles (Super Admin, Facility Manager, etc.) and a default admin user.

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

## Default Credentials

After seeding, you can login with:

- **Email**: `admin@facilitydesk.com`
- **Password**: `Password@123`

⚠️ **Change this password immediately in production!**

## API Documentation

The most up-to-date documentation is available via **Swagger UI** running locally:

👉 **[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)**

This interactive interface allows you to test all endpoints including Auth, Users, Roles, and Maintenance.

### Key Endpoints Overview

#### Authentication
- `POST /api/v1/auth/register`: Register new user
- `POST /api/v1/auth/login`: Login
- `POST /api/v1/auth/refresh`: Refresh access token
- `POST /api/v1/auth/logout`: Logout

#### Maintenance
- `POST /api/v1/maintenance`: Create Corrective Maintenance request
- `GET /api/v1/maintenance`: List tickets (filter by status, assignee, etc.)
- `PATCH /api/v1/maintenance/:id`: Update ticket (assign, close, etc.)

#### Users & Roles
- `GET /api/v1/users`: List users
- `GET /api/v1/roles`: List available roles
- `PUT /api/v1/users/:id`: Update user (assign role here)

## Database Schema Highlights

### User Model
- **One-to-Many** relationship with Roles (User belongs to one Role).
- `role`: The role assigned to the user.

### Role Model
- `name`: String (allows custom role names).
- `isSystem`: Boolean flag for core roles.

### Maintenance Model
- Tracks both `CORRECTIVE` and `PREVENTIVE` types.
- Links to `Site`, `Requester`, and `Performer`.

### Preventive Model
- Defines scheduling templates (Frequency, Next Run Date) for auto-generating tickets.

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Build
npm run build        # Compile TypeScript to JavaScript

# Production
npm start            # Run compiled JavaScript

# Database
npm run migrate      # Run database migrations (development)
npm run migrate:deploy  # Deploy migrations (production)
npm run seed         # Seed database with initial data
npm run generate     # Generate Prisma Client
npm run studio       # Open Prisma Studio (database GUI)
```

## Security Best Practices
- **Secrets**: Rotate JWT secrets regularly.
- **Passwords**: Enforce strong passwords.
- **Roles**: Use the Principle of Least Privilege when assigning roles.
- **HTTPS**: Always use HTTPS in production to secure cookies and headers.

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using TypeScript, Express, and Prisma**
