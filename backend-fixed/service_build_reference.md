# School Management System — Service Build Reference
> Use alongside `00_common_foundation.md`. The foundation is assumed here and not repeated.
> To build a service: send both documents as context and specify which service to implement.

---

## Services Overview

| # | Service | Schema | HTTP | Kafka Consumer | Kafka Producer |
|---|---|---|---|---|---|
| 1 | API Gateway | — | ✅ entry point | ❌ | ❌ |
| 2 | Auth Service | `auth` | ✅ | ✅ | ✅ |
| 3 | User Service | `user` | ✅ | ✅ | ✅ |
| 4 | School Service | `school` | ✅ | ✅ | ✅ |
| 5 | Notification Service | `notification` | ❌ | ✅ | ❌ |

---

## 1 — API Gateway

**Role:** Single HTTP entry point. Validates JWT. Proxies to downstream services. Zero business logic.

- Validates JWT and applies guards before forwarding any request
- Applies global rate limiting
- Routes each request to the correct downstream service over HTTP
- Does **not** connect to PostgreSQL
- Does **not** publish or consume any Kafka topics
- **Role enum:** Yes — needed for route-level `@Roles()` guard enforcement

---

## 2 — Auth Service

**Schema:** `auth`  
**Consumer group:** `auth-consumer`

### Tables

```
auth.credentials    — userId (uuid), hashedPassword (text), mustResetPassword (boolean)
auth.refresh_tokens — reserved for Phase 2
```

### HTTP Endpoints

| Method | Path | Guards | Description |
|---|---|---|---|
| POST | `/auth/signin` | none — public | Look up user via Kafka request/reply → verify password → return signed JWT |
| POST | `/auth/first-login-reset` | `JwtAuthGuard` only | Verify current password, hash new password, set `mustResetPassword = false` |
| POST | `/auth/change-password` | `JwtAuthGuard` only | Verify current password, hash new password. `mustResetPassword` unchanged |

> `MustResetGuard` is **absent** from both password endpoints — they are the escape hatches.

### Kafka — Topics Consumed (Request/Reply)

| Topic | Responds to | Returns |
|---|---|---|
| `auth.verify-password` | `{ userId: string, plainPassword: string }` | `{ valid: boolean }` |

### Kafka — Topics Produced (Request to User Service)

At signin, Auth Service does **not** have access to `user.users`. It must request user details:

| Topic published | Payload | Awaits reply on |
|---|---|---|
| `user.find-by-email` | `{ email: string }` | `user.find-by-email.reply` |

Reply shape: `{ id, email, role, isActive, mustResetPassword } | null`

If reply is `null` or times out (5s) → throw `401 UnauthorizedException`.

### Signin Flow (step by step)

```
1. Receive { email, password }
2. Publish to `user.find-by-email`, await reply (timeout: 5s → 503)
3. If user null or isActive=false → throw 401
4. Look up auth.credentials by userId
5. bcrypt.compare(password, hashedPassword) → if false → throw 401
6. Sign JWT: { sub: user.id, email, role, mustResetPassword }
7. Return { accessToken }
```

### DTOs

```ts
// signin.dto.ts
class SignInDto {
  @IsEmail()   email: string;
  @IsString()  password: string;
}

// change-password.dto.ts  (shared by both password endpoints)
class ChangePasswordDto {
  @IsString()              currentPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}
```

---

## 3 — User Service

**Schema:** `user`  
**Consumer group:** `user-consumer`

### Tables

```
user.users     — id (uuid), email (text), role (text), schoolId (uuid), isActive (boolean), createdAt
user.profiles  — userId (uuid), firstName (text), lastName (text), phone (text)
```

### Seeder
Implements `OnApplicationBootstrap` — see Common Foundation → Superadmin Seeding.

### Kafka — Topics Consumed (Request/Reply)

| Topic | Responds to | Returns |
|---|---|---|
| `user.find-by-email` | `{ email: string }` | `{ id, email, role, isActive, mustResetPassword } \| null` |

### Kafka — Topics Produced

#### Request/Reply (blocking — 5s timeout → 503)

| Topic | Payload | Awaits reply on | Used when |
|---|---|---|---|
| `auth.verify-password` | `{ userId, plainPassword }` | `auth.verify-password.reply` | Superadmin updating own credentials |
| `school.validate` | `{ schoolId }` | `school.validate.reply` | Before creating any user |

#### Events (async, no reply)

| Topic | Payload | Triggered when |
|---|---|---|
| `notification.email` | `{ type: 'welcome', to, tempPassword }` | New account created |
| `notification.email` | `{ type: 'password-reset', to, tempPassword }` | Admin force-resets a password |

---

### Superadmin Endpoints (`/superadmin/*`)

**Guard stack:** `JwtAuthGuard`, `MustResetGuard`, `RolesGuard` → `@Roles('superadmin')`

| Method | Path | Description |
|---|---|---|
| POST | `/superadmin/create-administration` | Body: `{ email, schoolId }`. Validate schoolId via Kafka → School Service (timeout 5s → 503). Generate temp password, hash it, write to `user.users` + `auth.credentials` (cross-service write via Kafka event to Auth Service — see note). Set `mustResetPassword=true`. Publish `notification.email` `welcome` event. |
| POST | `/superadmin/reset-admin-password/:id` | Generate new temp password, publish to Auth Service to update credentials (event: `auth.credentials-updated`). Publish `notification.email` `password-reset` event. |
| GET | `/superadmin/administrations` | List all `role='administration'` users |
| PATCH | `/superadmin/deactivate/:id` | Set `isActive=false` |
| PATCH | `/superadmin/update-credentials` | Body: `{ currentPassword, newEmail?, newPassword? }`. Verify password via Kafka → Auth Service (timeout 5s → 503). Update email and/or password. |

> **Cross-service credential write note:** When User Service creates a new account, it must also create the `auth.credentials` row. Since services cannot share schemas, User Service publishes an event on topic `auth.credentials-create` with `{ userId, hashedPassword, mustResetPassword: true }`. Auth Service consumes this and inserts the row. This keeps the auth schema owned exclusively by Auth Service.

---

### Administration Endpoints (`/administration/*`)

**Guard stack:** `JwtAuthGuard`, `MustResetGuard`, `RolesGuard` → `@Roles('administration')`, `ScopeGuard`  
All operations automatically scoped to `req.user.schoolId`.

| Method | Path | Description |
|---|---|---|
| POST | `/administration/create-user` | Body: `{ email, role }`. Role must be `teacher`, `student`, or `parent` — reject anything else with `400`. Generate temp password, create user, publish `auth.credentials-create` event, publish `notification.email` `welcome` event. |
| POST | `/administration/reset-password/:id` | Generate new temp password. Publish `auth.credentials-update` event `{ userId, hashedPassword, mustResetPassword: true }`. Publish `notification.email` `password-reset` event. Target must belong to same `schoolId`. |
| GET | `/administration/users` | List all users in own school |
| PATCH | `/administration/deactivate/:id` | Set `isActive=false`, scoped to own school |

---

### Profile Endpoints (`/profile/*`)

**Guard stack:** `JwtAuthGuard`, `MustResetGuard` — all authenticated roles

| Method | Path | Description |
|---|---|---|
| GET | `/profile/me` | Return own `user.users` + `user.profiles` merged |
| PATCH | `/profile/me` | Update `firstName`, `lastName`, `phone` only. Email and password not updatable here. |

---

### DTOs

```ts
// create-administration.dto.ts
class CreateAdministrationDto {
  @IsEmail()  email: string;
  @IsUUID()   schoolId: string;
}

// create-user.dto.ts
class CreateUserDto {
  @IsEmail()                               email: string;
  @IsIn(['teacher', 'student', 'parent'])  role: string;
}

// update-credentials.dto.ts
class UpdateCredentialsDto {
  @IsString()                    currentPassword: string;
  @IsEmail()    @IsOptional()    newEmail?: string;
  @IsString()   @IsOptional()
  @MinLength(8)                  newPassword?: string;
}

// update-profile.dto.ts
class UpdateProfileDto {
  @IsString() @IsOptional()  firstName?: string;
  @IsString() @IsOptional()  lastName?: string;
  @IsString() @IsOptional()  phone?: string;
}
```

---

## 4 — School Service

**Schema:** `school`  
**Consumer group:** `school-consumer`

### Tables

```
school.schools       — id (uuid), name (text), address (text), isActive (boolean), createdAt
school.admin_schools — adminId (uuid), schoolId (uuid)
```

### HTTP Endpoints

**Guard stack:** `JwtAuthGuard`, `MustResetGuard`, `RolesGuard` → `@Roles('superadmin')`

| Method | Path | Description |
|---|---|---|
| POST | `/schools` | Create a school. Must exist before an administration account can be created. |
| GET | `/schools` | List all schools |
| GET | `/schools/:id` | Get single school detail |
| PATCH | `/schools/:id` | Update school name / address |

### Kafka — Topics Consumed (Request/Reply)

| Topic | Responds to | Returns |
|---|---|---|
| `school.validate` | `{ schoolId: string }` | `{ exists: boolean }` |

**Role enum:** Not needed — the API Gateway enforces `superadmin` before requests arrive here.

---

## 5 — Notification Service

**Schema:** `notification`  
**Consumer group:** `notification-consumer`  
**No HTTP surface. No request/reply topics. Pure event consumer.**

### Tables

```
notification.email_logs — id (uuid), to (text), subject (text), status ('sent'|'failed'), error (text), createdAt
```

### Kafka — Topics Consumed (Events)

| Topic | Event type field | Action |
|---|---|---|
| `notification.email` | `welcome` | Send welcome email with temp password |
| `notification.email` | `password-reset` | Send reset email with new temp password |

Single topic, two job types distinguished by the `type` field in the payload:

```ts
// Payload shape for both event types:
{
  type: 'welcome' | 'password-reset';
  to: string;
  tempPassword: string;
}
```

### Email Templates

**welcome:**
> Subject: Your account has been created
>
> Your account has been created. Your temporary password is: `[tempPassword]`
> You must change this password the first time you log in.

**password-reset:**
> Subject: Your password has been reset
>
> Your password has been reset by an administrator. Your temporary password is: `[tempPassword]`
> Change it immediately after logging in.

### Consumer Behaviour

```ts
@EventPattern('notification.email')
async handleEmailEvent(@Payload() data: EmailEventPayload) {
  try {
    await this.mailerService.sendMail({ ... });
    await this.emailLogRepo.save({ to: data.to, status: 'sent', ... });
  } catch (err) {
    await this.emailLogRepo.save({ to: data.to, status: 'failed', error: err.message, ... });
    throw err; // re-throw so Kafka does NOT commit the offset → message redelivered
  }
}
```

- Re-throwing on failure ensures Kafka does not commit the offset — the message will be redelivered on the next poll
- This gives at-least-once delivery semantics
- Email logs capture both success and failure states for observability

### `app.module.ts` shape

```ts
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ schema: 'notification', ... }),
    TypeOrmModule.forFeature([EmailLog]),
    MailerModule.forRoot({ transport: { ... } }),
    // No ClientsModule — this service never produces Kafka messages
  ],
  controllers: [NotificationKafkaController],
  providers: [NotificationService],
})
```

---

## Auth Service — Additional Kafka Topics Consumed

Beyond the ones already listed, Auth Service also consumes these events published by User Service to maintain its own schema:

| Topic | Payload | Action |
|---|---|---|
| `auth.credentials-create` | `{ userId, hashedPassword, mustResetPassword: true }` | INSERT into `auth.credentials` |
| `auth.credentials-update` | `{ userId, hashedPassword?, mustResetPassword? }` | UPDATE `auth.credentials` for given userId |

This is the key to keeping schemas fully decoupled: User Service owns the creation flow, Auth Service owns its own table — they communicate the write via Kafka, never via shared DB access.

---

## Temp Password Generation (User Service)

```ts
import * as crypto from 'crypto';

const tempPassword = crypto.randomBytes(8).toString('hex'); // 16-char hex string
const hashedPassword = await bcrypt.hash(tempPassword, 10);
```

Then:
1. Store `hashedPassword` in the `auth.credentials-create` Kafka event
2. Set `mustResetPassword: true` in the same event
3. Pass the **plaintext** `tempPassword` in the `notification.email` Kafka event

The plaintext password is never stored anywhere. It exists only in transit through Kafka topics and in the email sent to the user.

---

## Deliverable Checklist (per service)

- [ ] `package.json` with all required dependencies
- [ ] `main.ts` — HTTP + Kafka microservice bootstrap; Notification Service skips `app.listen()`
- [ ] `app.module.ts` — TypeORM, ConfigModule, ClientsModule (for topics this service produces) wired correctly
- [ ] Feature folder(s): module / HTTP controller / Kafka controller / service / entity
- [ ] `dto/` subfolder per feature, one DTO file per action
- [ ] `common/guards/` — all four guards (HTTP-facing services only)
- [ ] `common/decorators/` — `@Roles`, `@CurrentUser`
- [ ] `common/enums/role.enum.ts` — only where role logic is enforced (User Service, API Gateway)
- [ ] `seeder/` — User Service only
- [ ] `.env` with all variables this service needs
- [ ] No placeholder comments — every file fully implemented