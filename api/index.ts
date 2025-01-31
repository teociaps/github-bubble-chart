import dotenv from 'dotenv';
import express, { Application } from 'express';
import api from './default.js';

dotenv.config();

const PORT = process.env.PORT || 9000;
const app: Application = express();

app.listen(PORT);

app.get('/', api);

export default app;
