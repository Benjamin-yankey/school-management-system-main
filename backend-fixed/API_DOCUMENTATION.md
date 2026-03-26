# SchoolSync Pro — Backend API Documentation

## Base URL
All requests go through the API Gateway.
```
http://localhost:3000
```

---

## Architecture Overview

```
Client
  │
  ▼
API Gateway :3000        ← JWT validation, role guards, blacklist check, rate limiting
  │
  ├──▶ Auth Service :3001       ← signin, password management
  ├──▶ User Service :3002       ← user accounts, profiles
  ├──▶ School Service :3003     ← school management
  └──▶ Notification Service     ← email only, no HTTP surface
```

### Inter-Service Communication
All services communicate exclusively through **Redpanda (Kafka)** — no direct service-to-service HTTP calls.

| From | To | Pattern | Topic |
|---|---|---|---|
| Auth Service | User Service | Request/Reply | `user.find-by-email` |
| User Service | Auth Service | Request/Reply | `auth.verify-password` |
| User Service | School Service | Request/Reply | `school.validate` |
| User Service | Auth Service | Event | `auth.credentials-create` |
| User Service | Auth Service | Event | `auth.credentials-update` |
| User Service | Notification Service | Event | `notification.email` |

---

## Authentication

### JWT Token
All protected endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <accessToken>
```

**Token payload:**
```json
{
  "sub": "uuid",
  "email": "user@example.com",
  "role": "superadmin | administration | teacher | student | parent",
  "mustResetPassword": false,
  "jti": "uuid"
}
```

**Token expiry:** 7 days

### Guard Execution Order
Every protected route runs guards in this order:
```
JwtAuthGuard → BlacklistGuard → MustResetGuard → RolesGuard
```

| Guard | Purpose |
|---|---|
| `JwtAuthGuard` | Validates JWT signature and expiry |
| `BlacklistGuard` | Checks Redis for revoked token JTI |
| `MustResetGuard` | Blocks access if `mustResetPassword=true` (except password endpoints) |
| `RolesGuard` | Enforces role-based access |

### First Login Flow
Every admin-created account starts with `mustResetPassword=true` and a temporary password sent by email.
```
1. POST /auth/signin        → receives accessToken (mustResetPassword=true in payload)
2. POST /auth/first-login-reset  → resets password, clears flag, invalidates token
3. POST /auth/signin        → receives clean accessToken
4. Access all other endpoints normally
```

---

## Roles

| Role | Created by | Scope |
|---|---|---|
| `superadmin` | `.env` seed on first boot | Global |
| `administration` | Superadmin | Scoped to one school |
| `teacher` | Administration | Scoped to one school |
| `student` | Administration | Scoped to one school |
| `parent` | Administration | Scoped to one school |

---

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Validation error or bad request (e.g. invalid schoolId) |
| `401` | Missing, invalid, or expired token / wrong credentials |
| `403` | Valid token but insufficient role, wrong school scope, or `mustResetPassword=true` |
| `404` | Resource not found |
| `503` | Downstream Kafka service did not reply within 5 seconds |

**Error shape:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Endpoints

---

### 🔓 Public

---

#### `POST /auth/signin`
Authenticate and receive a JWT access token.

**Request:**
```json
{
  "email": "admin@yourdomain.com",
  "password": "StrongPasswordHere123!"
}
```

**Response `200`:**
```json
{
  "accessToken": "<jwt>"
}
```

**Errors:**
- `401` — wrong email, wrong password, or account inactive
- `503` — user service unavailable

---

### 🔐 Auth — requires valid JWT

---

#### `POST /auth/signout`
Revokes the current token. Token is added to Redis blacklist for its remaining lifetime.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:** _(empty)_

---

#### `POST /auth/first-login-reset`
For accounts with `mustResetPassword=true`. Resets password, clears the flag, and invalidates the current token. User must sign in again.

> `MustResetGuard` is **not** applied here — this is the escape hatch.

**Request:**
```json
{
  "currentPassword": "tempPasswordFromEmail",
  "newPassword": "MyNewPassword123!"
}
```

**Response `200`:** _(empty)_

**Errors:**
- `401` — current password incorrect

---

#### `POST /auth/change-password`
Self-serve password change for any authenticated user. Invalidates the current token after success.

> `MustResetGuard` is **not** applied here.

**Request:**
```json
{
  "currentPassword": "currentPassword123!",
  "newPassword": "newPassword456!"
}
```

**Response `200`:** _(empty)_

**Errors:**
- `401` — current password incorrect

---

### 👑 Superadmin — role: `superadmin`

All superadmin endpoints require: `JwtAuthGuard → BlacklistGuard → MustResetGuard → RolesGuard(@superadmin)`

---

#### `POST /superadmin/create-administration`
Creates an administration account for a school. Validates the school exists, generates a temporary password, and sends a welcome email.

**Request:**
```json
{
  "email": "admin@school.com",
  "schoolId": "uuid"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "email": "admin@school.com",
  "role": "administration"
}
```

**Errors:**
- `400` — school not found
- `503` — school service unavailable

**Side effects:**
- Publishes `auth.credentials-create` → Auth Service creates credentials row
- Publishes `notification.email` (type: `welcome`) → email sent with temp password

---

#### `POST /superadmin/reset-admin-password/:id`
Force-resets an administration account's password. Generates a new temp password and sends it by email.

**Params:** `id` — userId (uuid)

**Response `200`:** _(empty)_

**Side effects:**
- Publishes `auth.credentials-update` → Auth Service updates credentials, sets `mustResetPassword=true`
- Publishes `notification.email` (type: `password-reset`) → email sent with new temp password

---

#### `GET /superadmin/administrations`
Lists all administration accounts across all schools.

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "email": "admin@school.com",
    "role": "administration",
    "schoolId": "uuid",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### `PATCH /superadmin/deactivate/:id`
Deactivates any user account. Sets `isActive=false`.

**Params:** `id` — userId (uuid)

**Response `200`:** _(empty)_

---

#### `PATCH /superadmin/update-credentials`
Updates the superadmin's own email and/or password. Requires current password verification via Kafka → Auth Service.

**Request:**
```json
{
  "currentPassword": "currentPassword123!",
  "newEmail": "newemail@domain.com",
  "newPassword": "newPassword456!"
}
```
> `newEmail` and `newPassword` are both optional — provide one or both.

**Response `200`:** _(empty)_

**Errors:**
- `403` — current password incorrect
- `503` — auth service unavailable

---

#### `POST /schools`
Creates a new school. A school must exist before an administration account can be created for it.

**Request:**
```json
{
  "name": "Springfield Elementary",
  "address": "123 Main St, Springfield"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "name": "Springfield Elementary",
  "address": "123 Main St, Springfield",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### `GET /schools`
Lists all schools.

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "name": "Springfield Elementary",
    "address": "123 Main St, Springfield",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### `GET /schools/:id`
Gets a single school by ID.

**Params:** `id` — schoolId (uuid)

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Springfield Elementary",
  "address": "123 Main St, Springfield",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `404` — school not found

---

#### `PATCH /schools/:id`
Updates a school's name and/or address.

**Params:** `id` — schoolId (uuid)

**Request:**
```json
{
  "name": "Springfield High School",
  "address": "456 Elm St, Springfield"
}
```

**Response `200`:** _(updated school object)_

---

### 🏫 Administration — role: `administration`

All administration endpoints require: `JwtAuthGuard → BlacklistGuard → MustResetGuard → RolesGuard(@administration) → ScopeGuard`

`ScopeGuard` automatically scopes all operations to the administration's own `schoolId`. Attempting to access users from another school returns `403`.

---

#### `POST /administration/create-user`
Creates a teacher, student, or parent account within the administration's school.

**Request:**
```json
{
  "email": "teacher@school.com",
  "role": "teacher"
}
```
> `role` must be one of: `teacher`, `student`, `parent`. Any other value returns `400`.

**Response `201`:**
```json
{
  "id": "uuid",
  "email": "teacher@school.com",
  "role": "teacher"
}
```

**Side effects:**
- Publishes `auth.credentials-create` → Auth Service creates credentials row
- Publishes `notification.email` (type: `welcome`) → email sent with temp password

---

#### `POST /administration/reset-password/:id`
Force-resets a user's password within the same school.

**Params:** `id` — userId (uuid)

**Response `200`:** _(empty)_

**Errors:**
- `403` — target user belongs to a different school
- `404` — user not found

**Side effects:**
- Publishes `auth.credentials-update` → sets `mustResetPassword=true`
- Publishes `notification.email` (type: `password-reset`)

---

#### `GET /administration/users`
Lists all users belonging to the administration's school.

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "email": "teacher@school.com",
    "role": "teacher",
    "schoolId": "uuid",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### `PATCH /administration/deactivate/:id`
Deactivates a user within the administration's school.

**Params:** `id` — userId (uuid)

**Response `200`:** _(empty)_

**Errors:**
- `403` — target user belongs to a different school
- `404` — user not found

---

### 👤 Profile — all authenticated roles

Requires: `JwtAuthGuard → BlacklistGuard → MustResetGuard`

---

#### `GET /profile/me`
Returns the authenticated user's account and profile data merged.

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "teacher@school.com",
  "role": "teacher",
  "schoolId": "uuid",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "userId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

---

#### `PATCH /profile/me`
Updates the authenticated user's profile. Only `firstName`, `lastName`, and `phone` are updatable here. Email and password changes go through their own dedicated endpoints.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```
> All fields are optional.

**Response `200`:** _(updated profile object, same shape as `GET /profile/me`)_

---

## Infrastructure Ports

| Service | Port | Notes |
|---|---|---|
| API Gateway | `3000` | Only public-facing port |
| Auth Service | `3001` | Internal only |
| User Service | `3002` | Internal only |
| School Service | `3003` | Internal only |
| Notification Service | — | No HTTP surface |
| PostgreSQL | `5432` | Single DB, multiple schemas |
| Redis | `6379` | Token blacklist |
| Redpanda | `9092` | Kafka-compatible broker |
| Redpanda Admin | `9644` | Redpanda admin API |

---

## Database Schemas

| Schema | Owned by | Tables |
|---|---|---|
| `auth` | Auth Service | `credentials` |
| `user` | User Service | `users`, `profiles` |
| `school` | School Service | `schools` |
| `notification` | Notification Service | `email_logs` |

> No cross-schema queries in application code. The superadmin seeder is the single documented exception.

---

## Quick Start

```bash
# 1. Start all services
cd backend
docker compose up --build

# 2. Sign in as superadmin (seeded from .env)
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"StrongPasswordHere123!"}'

# 3. Create a school
curl -X POST http://localhost:3000/schools \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Springfield Elementary","address":"123 Main St"}'

# 4. Create an administration account
curl -X POST http://localhost:3000/superadmin/create-administration \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@springfield.com","schoolId":"<schoolId>"}'
```
