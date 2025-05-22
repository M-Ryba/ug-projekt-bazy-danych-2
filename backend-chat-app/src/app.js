import 'dotenv/config';
import express from 'express';

// Router import
import userRouter from './routes/users.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the ChatApp API');
});

// Use routes
app.use('/users', userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
