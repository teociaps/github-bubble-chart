import express, { Application } from 'express';
import dotenv from 'dotenv';
import api from './api/index.js';

dotenv.config();

const PORT = process.env.PORT;
const app: Application = express();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', api);
