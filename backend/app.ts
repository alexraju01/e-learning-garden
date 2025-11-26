require('dotenv').config({ quiet: true });
import express from 'express';
import { taskRouter } from './routes/task.route';
import { userRouter } from './routes/user.route';

const app = express();
app.use(express.json());

// Resouces Routing
app.use('/api/v1/task', taskRouter);

app.use('/api/v1/user', userRouter);

export default app;
