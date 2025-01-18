import handler from '../../api/default';
import { getBubbleData } from '../../src/chart/utils';
import { createBubbleChart } from '../../src/chart/generator';
import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('../../src/chart/utils');
vi.mock('../../src/chart/generator');

describe('API handler', () => {
  it('should handle missing username', async () => {
    const req = { url: 'http://example.com' } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: '"username" is a required query parameter' });
  });

  it('should generate bubble chart SVG', async () => {
    const req = { url: 'http://example.com?username=testuser' } as any;
    const res = { setHeader: vi.fn(), send: vi.fn() } as any;
    (getBubbleData as Mock).mockResolvedValue([{ name: 'JavaScript', value: 70, color: 'yellow' }]);
    (createBubbleChart as Mock).mockReturnValue('<svg></svg>');

    await handler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml');
    expect(res.send).toHaveBeenCalledWith('<svg></svg>');
  });

  it('should handle errors', async () => {
    const req = { url: 'http://example.com?username=testuser' } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    (getBubbleData as Mock).mockRejectedValue(new Error('Failed to fetch'));

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch languages for specified user' });
  });
});
