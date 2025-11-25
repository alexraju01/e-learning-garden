require('dotenv').config({ quiet: true });
import express from 'express';
import { taskRouter } from './routes/task.route';

const app = express();
app.use(express.json());

// Resouces Routing
app.use('/api/v1/task', taskRouter);

export default app;
