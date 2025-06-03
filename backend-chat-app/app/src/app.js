import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import apiRouter from './routes/api.js';

const app = express();

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

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
