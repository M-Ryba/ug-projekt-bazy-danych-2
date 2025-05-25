import 'dotenv/config';
import express from 'express';
import { ExpressAuth, getSession } from '@auth/express';
import Keycloak from '@auth/express/providers/keycloak';
// API Router import
import apiRouter from './routes/api.js';

const app = express();

// Middleware for keycloak authentication
app.use(
  ExpressAuth({
    providers: [
      Keycloak({
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        issuer: process.env.KEYCLOAK_ISSUER
      })
    ],
    secret: process.env.AUTH_SECRET
  })
);

async function authSession(req, res, next) {
  res.locals.session = await getSession(req);
  next();
}

// Middleware to handle session
app.use(authSession);

// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Please use /api endpoint to access the API');
});

// Use routes
app.use('/api', apiRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
