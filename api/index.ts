import express, { Application } from 'express';
import dotenv from 'dotenv';
import api from './default.js';

dotenv.config();

const PORT = process.env.PORT || 9000;
const app: Application = express();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', api);

export default app;