# 📘 School Management System — API Master Reference

This document provides a comprehensive, in-depth guide to all endpoints available through the API Gateway (`:3000`).

---

## 🔐 Authentication & Security

All protected endpoints require a `Bearer` token in the `Authorization` header.

### Roles & Scopes
| Role | Responsibility | Data Scope |
|---|---|---|
| `superadmin` | System-wide configuration, school creation | Global |
| `administration` | School-level management, staff/student provisioning | Single School |
| `teacher` | Academic records, attendance, student oversight | Assigned Sections |
| `student` | Personal records, enrollment history | Own Record |
| `parent` | Child oversight, fee payments | Linked Children |

### Guard Execution Flow
`JwtAuthGuard` → `BlacklistGuard` → `MustResetGuard` → `RolesGuard` → `ScopeGuard` (for multi-tenancy)

---

## 🔑 Auth Service (`/auth`)

### `POST /auth/signin`
Authenticate and obtain a JWT.
- **Access**: Public
- **Request Body**:
  - `email`: (String) School email or personal contact email.
  - `password`: (String)
- **Response `201 OK`**:
  - `accessToken`: (JWT)
- **Note**: Supports **Dual-Login Identity**.
- **Errors**:
  - `401` — wrong email, wrong password, or account inactive
  - `503` — user service unavailable

### `POST /auth/signout`
Invalidate current session.
- **Access**: Authenticated
- **Response `200 OK`**: (Success message)

### `POST /auth/first-login-reset`
Required for first-time login for admin-created accounts.
- **Access**: Authenticated (Must Reset Password state)
- **Request Body**:
  - `currentPassword`: (String) Temporary password.
  - `newPassword`: (String) Professional password.

---

### 📊 Monitoring (`/metrics`)
Public metrics for Prometheus/Grafana oversight.
- **Access**: Public (Internal only via firewall in production)
- **Response**: Prometheus-formatted metrics string.

---

## 👥 User & Profile APIs (`/superadmin`, `/administration`, `/profile`)

### `POST /superadmin/create-administration`
Provision a school admin. Generates a professional school identity (`@ad.`).
- **Access**: Superadmin
- **Request Body**:
  - `email`: (String) Admin's personal contact email.
  - `firstName`: (String)
  - `lastName`: (String)
  - `schoolId`: (UUID)
- **Side Effect**: Emits Kafka `auth.credentials-create` event.

### `POST /administration/create-user`
Provision staff/students. Generates professional identity (`@tr.` or `@st.`).
- **Access**: Administration
- **Request Body**:
  - `email`: (String) Staff/Student personal contact email.
  - `firstName`: (String)
  - `lastName`: (String)
  - `role`: (`teacher` | `student`)

### `GET /profile/me`
Retrieve the authenticated user's profile and account metadata.
- **Access**: All Roles
- **Response**: User object merged with Profile entity.

---

## 🏫 School Service APIs

### Admissions (`/admissions`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/admissions/current` | `GET` | Public | Gets active admission year. |
| `/admissions/apply` | `POST` | Public | Submits a student application. |
| `/admissions/years` | `POST` | Superadmin/Admin | Creates a new admission year. |
| `/admissions/years/:id/open` | `PATCH` | Admin | Opens a window for public applications. |
| `/admissions/applications/:id/status` | `PATCH` | Admin | Updates status (accepted, rejected). |

### Students (`/students`)

#### `POST /students/enroll`
Finalizes student enrollment and generates a unique Student ID and School Email.
- **Access**: Admin
- **Request Body**:
  - `applicantId`: (UUID) The accepted application.
  - `classLevelId`: (UUID) target class (e.g., Grade 1).
  - `academicYearId`: (UUID)
  - `sectionId`: (UUID)

### Academic Structure (`/classes`, `/sections`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/classes/seed` | `POST` | Superadmin | Standardizes Grade 1 - Grade 12 levels. |
| `/classes/:id/sections` | `POST` | Admin | Creates a physical section (e.g., Section A). |
| `/academic-years/active` | `GET` | All | Returns current active academic cycle. |

### 📚 Subjects (`/subjects`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/subjects` | `POST` | Admin | Registers a new taught subject. |
| `/subjects` | `GET` | All | Lists all subjects (filter by `classLevelId`). |
| `/subjects/:id` | `DELETE` | Admin | Removes a subject from the curriculum. |

### Attendance & Performance (`/attendance`, `/grades`)

#### `POST /attendance/bulk`
Submit attendance for a section on a specific date.
- **Access**: Admin, Teacher
- **Request Schema**:
  ```json
  {
    "sectionId": "uuid",
    "termId": "uuid",
    "date": "2024-04-01",
    "attendance": [
      { "studentId": "uuid", "status": "present/absent/late" }
    ]
  }
  ```

#### `GET /grades/report-card/:studentId`
Generates a comprehensive term-based report card.
- **Access**: Admin, Teacher, Student (Self), Parent (Linked)

---

## 💰 Fee Service (`/fees`)

### `POST /fees`
Create a billable fee item.
- **Access**: Admin
- **Properties**: `name`, `amount`, `category`, `studentId`, `academicTermId`.

### `POST /fees/student/:studentId/pay`
Lump-sum payment applied across all pending fees by priority.
- **Access**: Administration, Superadmin

---

## 📢 Communication Service (`/comms`)

### `POST /comms/announcements`
Publish a platform-wide or targeted notice.
- **Access**: Administration
- **Audience Scope**: `all`, `teachers`, `students`, `parents`.

---

## 🔄 Inter-Service Dependency (Kafka)

| Pattern | Topic | Description |
|---|---|---|
| `Request/Reply` | `user.find-by-email` | Auth Service → User Service: Lookup during login. |
| `Request/Reply` | `school.get-details` | User Service → School Service: Fetch domain for email generation. |
| `Event` | `notification.email` | Various → Notification Service: Send SMTP alerts. |
| `Event` | `auth.credentials-create` | User Service → Auth Service: Register new account keys. |

---

## 🛠 Notification Service (Internal)

While the Notification Service has a proxy route in the Gateway, it has **no public HTTP surface**. It operates entirely as a reactive consumer of the `notification.email` Kafka topic.

- **Tasks**: Welcomes, Password Resets, Attendance Alerts.
- **Protocol**: Kafka Event (Async).
