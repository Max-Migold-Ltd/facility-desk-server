# Facility Desk Management System

A comprehensive Role-Based Access Control (RBAC) system for facility desk management built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure httpOnly cookies for refresh tokens
  - Token refresh and rotation mechanism
  - Password hashing with bcrypt

- **Role-Based Access Control (RBAC)**
  - Three built-in roles: Admin, Technician, User
  - Granular permission system per resource
  - Three access levels: NONE, READ, WRITE
  - Dynamic permission checking middleware

- **Security**
  - Helmet.js for HTTP security headers
  - CORS protection
  - Rate limiting on authentication endpoints
  - Input validation with express-validator
  - SQL injection prevention via Prisma
  - Bcrypt password hashing (12 rounds)

- **API Features**
  - RESTful API design
  - Comprehensive error handling
  - Request validation
  - Pagination support
  - Health check endpoint

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Language**: TypeScript v5.9.3
- **Database**: PostgreSQL
- **ORM**: Prisma v7.0.1
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcrypt

## Project Structure

```
facility-desk-server/
├── src/
│   ├── config/              # Configuration files
│   ├── errors/              # Custom error classes
│   ├── middleware/          # Express middleware
│   ├── modules/             # Feature modules (auth, users, roles, permissions)
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

4. **Start PostgreSQL**

   Ensure your PostgreSQL server is running and the database exists.

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

   This creates:
   - 3 roles (Admin, Technician, User)
   - 54 permissions (18 resources × 3 roles)
   - 1 default admin user

7. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

## Default Credentials

After seeding, you can login with:

- **Email**: `admin@facilitydesk.com`
- **Password**: `Admin@123`

⚠️ **Change this password immediately in production!**

## API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register a new user
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "roleName": "USER"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "role": {
        "id": "uuid",
        "name": "USER",
        "description": "Regular user with limited access"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGci..."
  }
}
```
*Also sets httpOnly cookie: `refresh_token`*

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@facilitydesk.com",
  "password": "Admin@123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGci..."
  }
}
```

#### Refresh Access Token
```http
POST /api/v1/auth/refresh
Cookie: refresh_token=<token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

#### Logout
```http
POST /api/v1/auth/logout
Cookie: refresh_token=<token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Endpoints

All user endpoints require authentication (Bearer token).

#### Get all users (Admin only)
```http
GET /api/v1/users?page=1&limit=10
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get user by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <access_token>
```

#### Update user
```http
PUT /api/v1/users/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "status": "INACTIVE"
}
```

#### Delete user
```http
DELETE /api/v1/users/:id
Authorization: Bearer <access_token>
```

### Role Endpoints

#### Get all roles
```http
GET /api/v1/roles
Authorization: Bearer <access_token>
```

#### Get role by ID with permissions
```http
GET /api/v1/roles/:id
Authorization: Bearer <access_token>
```

### Permission Endpoints

#### Get role permissions
```http
GET /api/v1/roles/:roleId/permissions
Authorization: Bearer <access_token>
```

#### Update role permissions
```http
PUT /api/v1/roles/:roleId/permissions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "permissions": [
    {
      "resource": "Asset",
      "accessLevel": "WRITE"
    },
    {
      "resource": "Facility",
      "accessLevel": "READ"
    }
  ]
}
```

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

## Database Schema

### User Model
- `id`: UUID
- `email`: Unique email address
- `password`: Bcrypt hashed password
- `firstName`, `lastName`: User name
- `status`: ACTIVE, INACTIVE, or SUSPENDED
- `roleId`: Foreign key to Role
- `createdAt`, `updatedAt`: Timestamps

### Role Model
- `id`: UUID
- `name`: ADMIN, TECHNICIAN, or USER (enum)
- `description`: Role description
- `createdAt`, `updatedAt`: Timestamps

### Permission Model
- `id`: UUID
- `roleId`: Foreign key to Role
- `resource`: Resource name (e.g., "Asset", "Facility")
- `accessLevel`: NONE, READ, or WRITE (enum)
- `createdAt`, `updatedAt`: Timestamps
- **Unique constraint**: `[roleId, resource]`

### RefreshToken Model
- `id`: UUID
- `token`: Unique JWT refresh token
- `userId`: Foreign key to User
- `expiresAt`: Expiration timestamp
- `createdAt`, `updatedAt`: Timestamps

## Permission Resources

The system includes 18 default resources:
- Access control device
- Accessory
- Accounting movement
- Analytical accounting
- Article
- Asset
- Asset model
- Category
- Consumable
- Facility
- Location
- Maintenance
- Manufacturer
- Supplier
- User
- Role
- Permission
- Report

## Role Permissions (Default)

### ADMIN
- **All resources**: WRITE access

### TECHNICIAN
- **WRITE access**: Accessory, Asset, Consumable, Maintenance
- **READ access**: Access control device, Article, Asset model, Facility, Location, Manufacturer, Supplier
- **NO access**: All other resources

### USER
- **READ access**: Article, Asset, Facility, Location
- **NO access**: All other resources

## Security Best Practices

### Before Production

1. **Change all secrets in `.env`**:
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `COOKIE_SECRET`

2. **Update database credentials**:
   - Use strong password for PostgreSQL
   - Consider using connection pooling

3. **Enable security features**:
   - Set `COOKIE_SECURE=true` (requires HTTPS)
   - Set `NODE_ENV=production`
   - Configure proper CORS origins

4. **Change default admin password**:
   - Login and update the password via API
   - Or delete and create a new admin user

5. **Review rate limits**:
   - Adjust based on your traffic patterns
   - Consider IP-based rate limiting

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `API_VERSION` | API version prefix | v1 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_ACCESS_SECRET` | Secret for access tokens | - |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `JWT_ACCESS_EXPIRY` | Access token expiration | 15m |
| `JWT_REFRESH_EXPIRY` | Refresh token expiration | 7d |
| `BCRYPT_ROUNDS` | Bcrypt hashing rounds | 12 |
| `COOKIE_SECRET` | Cookie signing secret | - |
| `COOKIE_DOMAIN` | Cookie domain | localhost |
| `COOKIE_SECURE` | Use secure cookies (HTTPS only) | false |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | http://localhost:3001 |
| `CORS_CREDENTIALS` | Allow credentials in CORS | true |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per window | 5 |

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { }
  }
}
```

### Common Error Codes

- `AUTH_ERROR` (401): Authentication failed
- `FORBIDDEN` (403): Insufficient permissions
- `VALIDATION_ERROR` (400): Invalid input
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Duplicate resource (e.g., email)
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Testing

### Manual Testing with curl

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "roleName": "USER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@facilitydesk.com",
    "password": "Admin@123"
  }'
```

**Get users (with auth):**
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify database exists: `createdb facility_desk_db`

### Migration Errors

**Error**: `Migration failed`

**Solution**:
1. Reset database: `npx prisma migrate reset`
2. Re-run migrations: `npm run migrate`
3. Re-seed: `npm run seed`

### Authentication Errors

**Error**: `Invalid token` or `Token expired`

**Solution**:
1. Refresh your access token using `/api/v1/auth/refresh`
2. If refresh token expired, login again
3. Check JWT secrets are set correctly in `.env`

### CORS Errors

**Error**: `CORS policy blocked`

**Solution**:
1. Add your frontend URL to `CORS_ORIGIN` in `.env`
2. Ensure `CORS_CREDENTIALS=true` if using cookies
3. Frontend must include `credentials: 'include'` in fetch/axios

## Future Enhancements

- [ ] Email verification on registration
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] Audit logs for permission changes
- [ ] User session management
- [ ] API rate limiting per user
- [ ] Comprehensive unit and integration tests
- [ ] API documentation with Swagger/OpenAPI
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using TypeScript, Express, and Prisma**
