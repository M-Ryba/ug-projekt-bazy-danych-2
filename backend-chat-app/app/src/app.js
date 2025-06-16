import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';

// Connect to MongoDB
import connectMongoose from '../mongoose/connection.js';
await connectMongoose();

import apiRouter from './routes/api.js';
import setupSocket from './socket.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);
setupSocket(server);

// Middleware to parse JSON requests
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  })
);

app.get('/', (req, res) => {
  res.send('Please use /api endpoint to access the API');
});

// Use routes
app.use('/api', apiRouter);

// Centralna obsługa błędów (musi być na końcu)
app.use(errorHandler);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
