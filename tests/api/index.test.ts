import handler from '../../api/index';
import { getBubbleData } from '../../src/chart/utils';
import { createBubbleChart } from '../../src/chart/generator';

jest.mock('../../src/chart/utils');
jest.mock('../../src/chart/generator');

describe('API handler', () => {
  it('should handle missing username', async () => {
    const req = { url: 'http://example.com' };
    const res = { send: jest.fn() };
    await handler(req, res);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('"username" is a required query parameter'));
  });

  it('should generate bubble chart SVG', async () => {
    const req = { url: 'http://example.com?username=testuser' };
    const res = { send: jest.fn(), setHeaders: jest.fn() };
    (getBubbleData as jest.Mock).mockResolvedValue([{ name: 'JavaScript', value: 70, color: 'yellow' }]);
    (createBubbleChart as jest.Mock).mockReturnValue('<svg></svg>');

    await handler(req, res);
    expect(res.setHeaders).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith('<svg></svg>');
  });

  it('should handle errors', async () => {
    const req = { url: 'http://example.com?username=testuser' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    (getBubbleData as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch languages for specified user' });
  });
});
