import dotenv from 'dotenv';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import api from './default.js';

dotenv.config();

const PORT = process.env.PORT || 9000;
const app: Application = express();

const isDebugMode = process.env.NODE_ENV === 'development';

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDebugMode ? Number.MAX_SAFE_INTEGER : 60,
  headers: false,
  message: 'Too many requests from this IP, please try again after a minute',
});
app.set('trust proxy', 1);
app.get('/', rateLimiter, api);

app.listen(PORT);

export default app;
