import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../api/index';
import dotenv from 'dotenv';
import { Server } from 'http';
import { AddressInfo } from 'net';

dotenv.config();

describe('Express App', () => {
  let server: Server;
  let dynamicPort: number;

  beforeAll(async () => {
    server = await new Promise<Server>((resolve, reject) => {
      const s = app.listen(0, () => {
        dynamicPort = (s.address() as AddressInfo).port;
        console.log(`Test server running on port ${dynamicPort}`);
        resolve(s);
      });
    });
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  it('should start the server on a dynamic port', () => {
    expect(dynamicPort).toBeGreaterThan(0);
  });

  it('should respond to GET / with the API response', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(400);
  });
});
