import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * The single passport "jwt" strategy for the whole monolith. Every controller's
 * JwtAuthGuard (AuthGuard('jwt')) resolves to this one strategy.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    role: string;
    schoolId?: string;
    mustResetPassword?: boolean;
    jti?: string;
  }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
      mustResetPassword: payload.mustResetPassword,
    };
  }
}
