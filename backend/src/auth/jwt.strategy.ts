import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // IMPORTANT: This should be loaded from a config service/env variable
      secretOrKey: 'HARDCODED_SECRET_REPLACE_ME',
    });
  }

  async validate(payload: any) {
    // The payload contains the data we put in it when we signed the JWT
    // Here, we can do additional validation, e.g., check if user is still in the DB
    return { userId: payload.sub, email: payload.email };
  }
}
