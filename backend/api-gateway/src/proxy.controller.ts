import { All, Controller, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { MustResetGuard } from "./common/guards/must-reset.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { BlacklistGuard } from "./common/guards/blacklist.guard";
import { Roles } from "./common/decorators/roles.decorator";
import { Role } from "./common/enums/role.enum";
import * as http from "http";
import * as https from "https";
import { URL } from "url";

@Controller()
export class ProxyController {
  private urls: Record<string, string>;

  constructor(private readonly config: ConfigService) {
    this.urls = {
      auth: this.config.get<string>("AUTH_SERVICE_URL"),
      user: this.config.get<string>("USER_SERVICE_URL"),
      school: this.config.get<string>("SCHOOL_SERVICE_URL"),
    };
  }

  // ── Public ────────────────────────────────────────────────────────────────
  // Specific public routes declared FIRST — before any wildcard that shares
  // their prefix — so NestJS matches them before the guarded wildcards.

  @All("/auth/signin")
  proxySignIn(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "auth");
  }

  @All("/admissions/current")
  proxyAdmissionsCurrent(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @All("/admissions/apply")
  proxyAdmissionsApply(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard)
  @All("/auth/*")
  proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "auth");
  }

  // ── Superadmin ────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @All("/superadmin/*")
  proxySuperadmin(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "user");
  }

  // ── Administration sub-routes (school service) ────────────────────────────
  // MUST come before /administration/* wildcard (user service) or they will
  // never be reached.

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/administration/teachers*")
  proxyTeacherManagement(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/administration/parents*")
  proxyParentManagement(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  // ── Administration wildcard (user service) ────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.ADMINISTRATION)
  @All("/administration/*")
  proxyAdministration(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "user");
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard)
  @All("/profile/*")
  proxyProfile(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "user");
  }

  // ── Schools ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/schools*")
  proxySchools(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  // ── Admissions (protected) ────────────────────────────────────────────────
  // Declared after the public /admissions/current and /admissions/apply above.

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/admissions/*")
  proxyAdmissionsProtected(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/academic-years*")
  proxyAcademicYears(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/classes*")
  proxyClasses(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/sections*")
  proxySections(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/students*")
  proxyStudents(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/promotions*")
  proxyPromotions(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION)
  @All("/academic-terms*")
  proxyAcademicTerms(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMINISTRATION,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  )
  @All("/attendance*")
  proxyAttendance(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(
    Role.SUPERADMIN,
    Role.ADMINISTRATION,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT,
  )
  @All("/grades*")
  proxyGrades(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMINISTRATION, Role.STUDENT, Role.PARENT)
  @All("/fees*")
  proxyFees(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  // ── Teacher self-service ──────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @All("/teacher/*")
  proxyTeacher(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  // ── Student portal ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @All("/student-portal/*")
  proxyStudentPortal(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  // ── Parent portal ─────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, BlacklistGuard, MustResetGuard, RolesGuard)
  @Roles(Role.PARENT)
  @All("/parent/*")
  proxyParent(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, "school");
  }

  // ── Helper ────────────────────────────────────────────────────────────────s

  private forward(req: Request, res: Response, service: string): void {
    const base = this.urls[service];
    const parsed = new URL(base);
    const isHttps = parsed.protocol === "https:";
    const transport = isHttps ? https : http;

    const bodyStr =
      req.body && Object.keys(req.body).length
        ? JSON.stringify(req.body)
        : null;

    const headers: http.OutgoingHttpHeaders = {
      ...req.headers,
      host: parsed.host,
    };

    if (bodyStr) {
      headers["content-type"] = "application/json";
      headers["content-length"] = Buffer.byteLength(bodyStr).toString();
    } else {
      delete headers["content-length"];
    }

    const options: http.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: req.originalUrl,
      method: req.method,
      headers,
    };

    const proxyReq = transport.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode || 502);

      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (value !== undefined) res.setHeader(key, value);
      });
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      if (!res.headersSent) {
        res.status(502).json({ message: "Bad Gateway", error: err.message });
      }
    });

    if (bodyStr) {
      proxyReq.write(bodyStr);
    }
    proxyReq.end();
  }
}