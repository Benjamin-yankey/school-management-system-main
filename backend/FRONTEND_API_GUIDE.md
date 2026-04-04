# 🖥️ Frontend API Implementation Guide

This guide maps backend endpoints to their corresponding frontend modules and UI dashboards. All requests must use the Base URL: `http://localhost:3000`.

---

## 🌐 1. Public Website APIs
Used for the public-facing landing page and admission forms.

### Active Year
- **Method**: `GET`
- **Endpoint**: `/admissions/current`
- **Description**: Returns the current open admission cycle object.

### Submit Application
- **Method**: `POST`
- **Endpoint**: `/admissions/apply`
- **Payload**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "gender": "female",
  "dateOfBirth": "2015-05-20",
  "address": "123 Maple Dr",
  "parentName": "John Doe",
  "parentPhone": "+1234567890",
  "parentEmail": "parent@example.com",
  "previousSchool": "Green Valley Pre-school",
  "admissionYearId": "uuid"
}
```

---

## 🔑 2. Authentication & Onboarding
Core flows for session management and first-time user setup.

### Sign In
- **Method**: `POST`
- **Endpoint**: `/auth/signin`
- **Payload**:
```json
{
  "email": "user@school.com", 
  "password": "Password123!"
}
```
> Supports **Dual-Login** (School or Personal Email).

### First Reset
- **Method**: `POST`
- **Endpoint**: `/auth/first-login-reset`
- **Payload**:
```json
{
  "currentPassword": "tempPassword",
  "newPassword": "SecureNewPassword123!"
}
```
> **Crucial**: Mandated for first-time admin/staff login.

---

## 👑 3. Superadmin Dashboard
For managing the global multi-tenant environment.

### Register School
- **Method**: `POST` | `/schools`
- **Payload**: `{ "name": "Springfield Elementary", "address": "123 Main St", "domain": "springfield.edu" }`

### Update School
- **Method**: `PATCH` | `/schools/:id`
- **Payload**: `{ "name": "Springfield High", "address": "456 Oak Ave" }`

---

## 🏫 4. School Administration Dashboard
The primary engine for day-to-day school operations.

### Staff Provisioning (Teacher/Student)
- **Method**: `POST` | `/administration/create-user`
- **Payload**: `{ "email": "contact@person.com", "firstName": "John", "lastName": "Smith", "role": "teacher" }`

### Admissions Management
- **Method**: `POST` | `/admissions/years`
- **Payload**: `{ "name": "2024/2025 Academic Year", "startDate": "2024-09-01", "endDate": "2025-07-30" }`

- **Method**: `PATCH` | `/admissions/applications/:id/status`
- **Payload**: `{ "status": "accepted", "notes": "Passes entrance exam" }`

### Enrollment Workflow
- **Method**: `POST` | `/students/enroll`
- **Payload**: `{ "applicantId": "uuid", "classLevelId": "uuid", "academicYearId": "uuid", "sectionId": "uuid" }`

### Academic Configuration (Sections/Subjects)
- **Method**: `POST` | `/classes/:id/sections`
- **Payload**: `{ "name": "Section A", "capacity": 30 }`

- **Method**: `POST` | `/subjects`
- **Payload**: `{ "name": "Mathematics", "code": "MATH101", "classLevelId": "uuid" }`

### Finance & Billing
- **Method**: `POST` | `/fees`
- **Payload**: `{ "name": "Term 1 Tuition", "amount": 500.0, "category": "tuition", "studentId": "uuid", "academicTermId": "uuid" }`

- **Method**: `PATCH` | `/fees/:id/pay`
- **Payload**: `{ "amount": 250.0, "reference": "CHQ-9901" }`

### Communication
- **Method**: `POST` | `/comms/announcements`
- **Payload**: 
```json
{
  "title": "Welcome Back",
  "content": "School starts next Monday at 8 AM.",
  "targetRoles": ["students", "parents"]
}
```

### Promotions
- **Method**: `POST` | `/promotions/bulk`
- **Payload**: `{ "sourceClassLevelId": "uuid", "targetClassLevelId": "uuid", "academicYearId": "uuid" }`

---

## 🧑‍🏫 5. Teacher Portal
Classroom management for assigned staff.

### Bulk Attendance
- **Method**: `POST` | `/attendance/bulk`
- **Payload**: `{ "sectionId": "uuid", "termId": "uuid", "date": "2024-04-01", "attendance": [{ "studentId": "uuid", "status": "present" }] }`

### Bulk Grading
- **Method**: `POST` | `/grades/bulk`
- **Payload**: `{ "sectionId": "uuid", "subjectId": "uuid", "termId": "uuid", "grades": [{ "studentId": "uuid", "score": 85 }] }`

---

## 🎓 6. Student & Parent Portals

### Parent: Link Child
- **Method**: `POST` | `/parent/children`
- **Payload**: `{ "studentId": "uuid", "relationship": "Father" }`

---

## ⚠️ Important Implementation Notes

### Error 503 (Kafka Delay)
Since the system is event-driven, some operations (like `create-user`) rely on Kafka. If you receive a `503`, it usually means a background service is restarting or the broker is busy. Implement a retry or a "Please wait" indicator.

### Scope Control
The **Gateway** automatically enforces school boundaries. You don't need to manually filter most list results; the API will only return data belonging to your authenticated `schoolId`.
