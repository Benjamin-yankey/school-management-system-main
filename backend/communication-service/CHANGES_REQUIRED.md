# Changes required in your existing codebase
# ─────────────────────────────────────────────────────────────────────────────

## 1. auth-service/src/auth/auth.service.ts
## Add schoolId to the JWT payload so the communication service can scope
## announcements per school without a Kafka lookup on every request.

FIND:
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      mustResetPassword: credential.mustResetPassword,
      jti: crypto.randomUUID(),
    });

REPLACE WITH:
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,           // ← add this line
      mustResetPassword: credential.mustResetPassword,
      jti: crypto.randomUUID(),
    });


## 2. init-db.sql
## Add the communication schema alongside the existing ones.

FIND:
    CREATE SCHEMA notification;

REPLACE WITH:
    CREATE SCHEMA notification;
    CREATE SCHEMA communication;


## 3. docker-compose.yml
## Add the communication-service block and wire it in.
## Place this under the notification-service block:

  communication-service:
    build: ./communication-service
    container_name: school_communication
    env_file: ./communication-service/.env
    ports:
      - '3005:3005'
    depends_on:
      postgres:
        condition: service_healthy
      redpanda-init:
        condition: service_completed_successfully
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 192M

## Also add communication-service to the api-gateway depends_on list:

FIND:
    depends_on:
      - auth-service
      - user-service
      - school-service
      - redis

REPLACE WITH:
    depends_on:
      - auth-service
      - user-service
      - school-service
      - communication-service
      - redis


## 4. api-gateway/.env
## Add the communication service URL:

COMM_SERVICE_URL=http://communication-service:3005


## 5. api-gateway/src/proxy.controller.ts
## Add to the urls map in the constructor:

FIND:
    this.urls = {
      auth: this.config.get<string>('AUTH_SERVICE_URL'),
      user: this.config.get<string>('USER_SERVICE_URL'),
      school: this.config.get<string>('SCHOOL_SERVICE_URL'),
    };

REPLACE WITH:
    this.urls = {
      auth: this.config.get<string>('AUTH_SERVICE_URL'),
      user: this.config.get<string>('USER_SERVICE_URL'),
      school: this.config.get<string>('SCHOOL_SERVICE_URL'),
      communication: this.config.get<string>('COMM_SERVICE_URL'),
    };

## Then add the announcements proxy route.
## Place it before the final private forward() helper, after the parent portal block:

  // ── Announcements ─────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMINISTRATION,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  )
  @All('/comms/announcements*')
  proxyAnnouncements(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, 'communication');
  }
