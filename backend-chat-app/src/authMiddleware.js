import 'dotenv/config';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
  }),
  audience: process.env.KEYCLOAK_CLIENT_ID,
  issuer: process.env.KEYCLOAK_ISSUER,
  algorithms: ['RS256']
});
