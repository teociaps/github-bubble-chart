import { Request, Response } from 'express';
import { describe, it, expect, vi, Mock } from 'vitest';
import handler from '../../api/default';
import { defaultHeaders } from '../../api/utils';
import { createBubbleChart } from '../../src/chart/generator';
import { getBubbleData } from '../../src/chart/utils';

vi.mock('../../src/chart/utils');
vi.mock('../../src/chart/generator');

// Add mock for the API utils to stub fetchConfigFromRepo and related helpers.
vi.mock('../../api/utils', () => ({
  defaultHeaders: { 'Content-Type': 'image/svg+xml' },
  fetchConfigFromRepo: vi.fn().mockResolvedValue({
    options: { custom: true },
    data: [{ name: 'TestLang', value: 42, color: 'red' }],
  }),
  handleMissingUsername: vi.fn((error, res) => {
    res.status(400).send('Missing Required Parameter');
  }),
  parseParams: (req: Request) => {
    const url = new URL(req.url);
    return {
      get: (key: string) => url.searchParams.get(key),
      getMode: () => url.searchParams.get('mode') || 'default',
      getNumberValue: (key: string, defaultVal: number) =>
        Number(url.searchParams.get(key)) || defaultVal,
      parseTitleOptions: () => ({}),
      getValuesDisplayOption: () => url.searchParams.get('display-values'),
      parseLegendOptions: () => ({}),
      getTheme: (key: string, defaultVal: string) =>
        url.searchParams.get(key) || defaultVal,
      getLanguagesCount: (count: number) => count,
    };
  },
  handleErrorResponse: vi.fn((error, res) => {
    res.status(500).send({ error: 'An unexpected error occurred' });
  }),
}));

describe('API handler', () => {
  it('should handle missing username', async () => {
    const req = {
      url: 'http://example.com',
      get: vi.fn().mockReturnValue('example.com'),
      protocol: 'http',
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining(`Missing Required Parameter`),
    );
  });

  it('should generate bubble chart SVG', async () => {
    const req = {
      url: 'http://example.com?username=testuser',
    } as unknown as Request;
    const res = { setHeaders: vi.fn(), send: vi.fn() } as unknown as Response;
    (getBubbleData as Mock).mockResolvedValue([
      { name: 'JavaScript', value: 70, color: 'yellow' },
    ]);
    (createBubbleChart as Mock).mockReturnValue('<svg></svg>');

    await handler(req, res);
    expect(res.setHeaders).toHaveBeenCalledWith(defaultHeaders);
    expect(res.send).toHaveBeenCalledWith('<svg></svg>');
  });

  it('should handle errors', async () => {
    const req = {
      url: 'http://example.com?username=testuser',
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response;
    (getBubbleData as Mock).mockRejectedValue(
      new Error('Generic failed to fetch'),
    );

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: 'An unexpected error occurred',
    });
  });

  it('should handle custom-config mode', async () => {
    // Prepare a request with custom-config parameters.
    const req = {
      url: 'http://example.com?username=testuser&config-path=somePath&mode=custom-config&config-branch=dev',
      get: vi.fn().mockReturnValue('example.com'),
      protocol: 'http',
    } as unknown as Request;

    // Stub createBubbleChart to return valid SVG.
    (createBubbleChart as Mock).mockResolvedValue('<svg>custom</svg>');
    const res = {
      setHeaders: vi.fn(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await handler(req, res);

    // Expect fetchConfigFromRepo to have been called.
    const { fetchConfigFromRepo } = await import('../../api/utils');
    expect(fetchConfigFromRepo).toHaveBeenCalledWith(
      'testuser',
      'somePath',
      'dev',
    );
    // Expect createBubbleChart to use the custom data and options.
    expect(createBubbleChart).toHaveBeenCalledWith(
      [{ name: 'TestLang', value: 42, color: 'red' }],
      { custom: true },
    );
    expect(res.setHeaders).toHaveBeenCalledWith({
      'Content-Type': 'image/svg+xml',
    });
    expect(res.send).toHaveBeenCalledWith('<svg>custom</svg>');
  });
});
