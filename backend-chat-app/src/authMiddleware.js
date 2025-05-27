import 'dotenv/config';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
  }),
  audience: 'account',
  issuer: process.env.KEYCLOAK_ISSUER,
  algorithms: ['RS256']
});

export const syncUserWithDatabase = async (req, res, next) => {
  try {
    const { preferred_username, email } = req.auth;
    if (!preferred_username || !email) {
      return res.status(400).json({ message: 'No username or email in user token' });
    }
    // Find user by username
    let user = await prisma.user.findUnique({ where: { username: preferred_username } });
    if (!user) {
      // If user does not exist, create a new one
      user = await prisma.user.create({
        data: {
          username: preferred_username,
          email,
          displayName: preferred_username
        }
      });
    } else {
      // If email has changed, update the user
      if (user.email !== email) {
        user = await prisma.user.update({
          where: { username: preferred_username },
          data: {
            email
          }
        });
      }
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
