require('dotenv').config({ quiet: true });
import express from 'express';
import { taskRouter } from './routes/task.route';
import { globalErrorHandler } from './controllers/error.controller';
import AppError from './lib/AppError';

const app = express();
app.use(express.json());

// Resouces Routing
app.use('/api/v1/task', taskRouter);

app.get('/*splat', async (req, res, next) => {
  next(
    new AppError(`can't find the ${req.originalUrl} on the this server`, 404),
  );
});

app.use(globalErrorHandler);

export default app;
