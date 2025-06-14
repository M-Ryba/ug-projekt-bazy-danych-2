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
    const { preferred_username, email, realm_access } = req.auth;
    if (!preferred_username || !email) {
      return res.status(400).json({ message: 'No username or email in user token' });
    }
    // Check if user is an admin
    const isAdminFromToken = Array.isArray(realm_access?.roles) && realm_access.roles.includes('admin');
    // Find user by username
    let user = await prisma.user.findUnique({ where: { username: preferred_username } });
    if (!user) {
      // If user does not exist, create a new one
      user = await prisma.user.create({
        data: {
          username: preferred_username,
          email,
          displayName: preferred_username,
          isAdmin: isAdminFromToken
        }
      });
    } else {
      // If email or admin status changed, update the user
      const updateData = {};
      if (user.email !== email) {
        updateData.email = email;
      }
      if (user.isAdmin !== isAdminFromToken) {
        updateData.isAdmin = isAdminFromToken;
      }
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { username: preferred_username },
          data: updateData
        });
      }
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
