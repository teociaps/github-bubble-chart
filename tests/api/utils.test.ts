import {
  CustomURLSearchParams,
  parseParams,
  fetchConfigFromRepo,
} from '../../api/utils';
import { LightTheme } from '../../src/chart/themes';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { FetchError, ValidationError } from '../../src/errors/custom-errors';
import {
  GitHubNotFoundError,
  GitHubRateLimitError,
} from '../../src/errors/github-errors';
import {
  isDevEnvironment,
  mapConfigToBubbleChartOptions,
} from '../../src/common/utils';
import { CustomConfig } from '../../src/chart/types/config';
import path from 'path';
import fs from 'fs';

describe('API Utils', () => {
  describe('CustomURLSearchParams', () => {
    it('should return default string value if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getStringValue('key', 'default')).toBe('default');
    });

    it('should return string value if key is present', () => {
      const params = new CustomURLSearchParams('key=value');
      expect(params.getStringValue('key', 'default')).toBe('value');
    });

    it('should return default number value if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getNumberValue('key', 0)).toBe(0);
    });

    it('should return parsed number value if key is present', () => {
      const params = new CustomURLSearchParams('key=42');
      expect(params.getNumberValue('key', 0)).toBe(42);
    });

    it('should return default boolean value if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getBooleanValue('key', true)).toBe(true);
    });

    it('should return parsed boolean value if key is present', () => {
      const params = new CustomURLSearchParams('key=true');
      expect(params.getBooleanValue('key', false)).toBe(true);
    });

    it('should return default theme if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getTheme('theme', new LightTheme())).toBeInstanceOf(
        LightTheme,
      );
    });

    it('should return parsed theme if key is present', () => {
      const params = new CustomURLSearchParams('theme=light');
      expect(params.getTheme('theme', new LightTheme())).toBeInstanceOf(
        LightTheme,
      );
    });

    it('should return default text anchor value if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getTextAnchorValue('key', 'middle')).toBe('middle');
    });

    it('should return parsed text anchor value if key is present', () => {
      const params = new CustomURLSearchParams('key=center');
      expect(params.getTextAnchorValue('key', 'middle')).toBe('middle');
    });

    it('should return default languages count if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getLanguagesCount(5)).toBe(5);
    });

    it('should return parsed languages count if key is present', () => {
      const params = new CustomURLSearchParams('langs-count=10');
      expect(params.getLanguagesCount(5)).toBe(10);
    });

    it('should return minimum languages count if parsed value is less than 1', () => {
      const params = new CustomURLSearchParams('langs-count=0');
      expect(params.getLanguagesCount(5)).toBe(1);
    });

    it('should return maximum languages count if parsed value is greater than 20', () => {
      const params = new CustomURLSearchParams('langs-count=21');
      expect(params.getLanguagesCount(5)).toBe(20);
    });

    it('should parse title options correctly', () => {
      const params = new CustomURLSearchParams(
        'title=MyChart&title-size=30&title-weight=normal&title-color=#000000&title-align=center',
      );
      const titleOptions = params.parseTitleOptions();
      expect(titleOptions).toEqual({
        text: 'MyChart',
        fontSize: '30px',
        fontWeight: 'normal',
        fill: '#000000',
        textAnchor: 'middle',
      });
    });

    it('should parse legend options correctly', () => {
      const params = new CustomURLSearchParams(
        'legend=false&legend-align=right',
      );
      const legendOptions = params.parseLegendOptions();
      expect(legendOptions).toEqual({
        show: false,
        align: 'right',
      });
    });

    it('should return default mode if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getMode()).toBe('top-langs');
    });

    it('should return parsed mode if key is present', () => {
      const params = new CustomURLSearchParams('mode=custom-config');
      expect(params.getMode()).toBe('custom-config');
    });

    it('should return default mode if parsed mode is invalid', () => {
      const params = new CustomURLSearchParams('mode=invalid-mode');
      expect(params.getMode()).toBe('top-langs');
    });

    it('should return default percentage display option if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getPercentageDisplayOption('percentage-display')).toBe(
        'legend',
      );
    });

    it('should return parsed percentage display option if key is present', () => {
      const params = new CustomURLSearchParams('percentage-display=all');
      expect(params.getPercentageDisplayOption('percentage-display')).toBe(
        'all',
      );
    });

    it('should return default percentage display option if parsed value is invalid', () => {
      const params = new CustomURLSearchParams('percentage-display=invalid');
      expect(params.getPercentageDisplayOption('percentage-display')).toBe(
        'legend',
      );
    });

    it('should return default title if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getStringValue('title', 'Bubble Chart')).toBe(
        'Bubble Chart',
      );
    });

    it('should return parsed title if key is present', () => {
      const params = new CustomURLSearchParams('title=MyChart');
      expect(params.getStringValue('title', 'Bubble Chart')).toBe('MyChart');
    });

    it('should return default legend alignment if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getStringValue('legend-align', 'center')).toBe('center');
    });

    it('should return parsed legend alignment if key is present', () => {
      const params = new CustomURLSearchParams('legend-align=right');
      expect(params.getStringValue('legend-align', 'center')).toBe('right');
    });

    it('should return default title size if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getNumberValue('title-size', 24)).toBe(24);
    });

    it('should return parsed title size if key is present', () => {
      const params = new CustomURLSearchParams('title-size=30');
      expect(params.getNumberValue('title-size', 24)).toBe(30);
    });

    it('should return default title weight if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getStringValue('title-weight', 'bold')).toBe('bold');
    });

    it('should return parsed title weight if key is present', () => {
      const params = new CustomURLSearchParams('title-weight=normal');
      expect(params.getStringValue('title-weight', 'bold')).toBe('normal');
    });

    it('should return default title color if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getStringValue('title-color', '#000000')).toBe('#000000');
    });

    it('should return parsed title color if key is present', () => {
      const params = new CustomURLSearchParams('title-color=#ffffff');
      expect(params.getStringValue('title-color', '#000000')).toBe('#ffffff');
    });

    it('should return default title alignment if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getTextAnchorValue('title-align', 'middle')).toBe('middle');
    });

    it('should return parsed title alignment if key is present', () => {
      const params = new CustomURLSearchParams('title-align=center');
      expect(params.getTextAnchorValue('title-align', 'middle')).toBe('middle');
    });
  });

  describe('parseParams', () => {
    it('should parse URL parameters', () => {
      const req = { url: 'http://example.com?key=value' };
      const params = parseParams(req as any);
      expect(params.get('key')).toBe('value');
    });

    it('should return empty params if no query string is present', () => {
      const req = { url: 'http://example.com' };
      const params = parseParams(req as any);
      expect(params.get('key')).toBeNull();
    });
  });

  vi.mock('fs');
  vi.mock('path');
  vi.mock('../../src/common/utils', () => ({
    isDevEnvironment: vi.fn(),
    mapConfigToBubbleChartOptions: vi
      .fn()
      .mockReturnValue({ titleOptions: { text: 'Test Chart' } } as any),
  }));
  vi.stubGlobal('fetch', vi.fn());

  const mockConfig: CustomConfig = {
    options: { titleOptions: { text: 'Test Chart' } } as any,
    data: [{ name: 'Node.js', value: 50 }] as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchConfigFromRepo', () => {
    it('fetches configuration from local file in development environment', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(true);
      const localPath = '/example-config.json';
      vi.mocked(path.resolve).mockReturnValue(localPath);
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(mapConfigToBubbleChartOptions);

      const result = await fetchConfigFromRepo('username', 'filePath');

      expect(result).toEqual({
        options: { titleOptions: { text: 'Test Chart' } },
        data: [{ name: 'Node.js', value: 50 }],
      });
      expect(fs.existsSync).toHaveBeenCalledWith(localPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(localPath, 'utf-8');
      expect(mapConfigToBubbleChartOptions).toHaveBeenCalledWith(
        mockConfig.options,
      );
    });

    it('throws an error if local config file is missing in development environment', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(true);
      vi.mocked(path.resolve).mockReturnValue('/example-config.json');
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(fetchConfigFromRepo('username', 'filePath')).rejects.toThrow(
        FetchError,
      );
    });

    it('fetches configuration from GitHub in non-development environment', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(false);
      const mockResponse = {
        ok: true,
        json: async () => mockConfig,
      } as any;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      const result = await fetchConfigFromRepo('username', 'filePath');

      expect(result).toEqual({
        options: { titleOptions: { text: 'Test Chart' } },
        data: [{ name: 'Node.js', value: 50 }],
      });
      expect(fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/username/username/main/filePath',
        expect.objectContaining({
          headers: { Authorization: expect.any(String) },
        }),
      );
    });

    it('throws GitHubNotFoundError if the file is not found on GitHub', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(false);
      const mockResponse = { ok: false, status: 404 } as any;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      await expect(fetchConfigFromRepo('username', 'filePath')).rejects.toThrow(
        GitHubNotFoundError,
      );
    });

    it('throws GitHubRateLimitError if the rate limit is exceeded', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(false);
      const mockResponse = {
        ok: false,
        status: 403,
        headers: { get: vi.fn(() => '0') },
      } as any;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      await expect(fetchConfigFromRepo('username', 'filePath')).rejects.toThrow(
        GitHubRateLimitError,
      );
    });

    it('throws FetchError for other HTTP errors', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(false);
      const mockResponse = { ok: false, status: 500 } as any;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      await expect(fetchConfigFromRepo('username', 'filePath')).rejects.toThrow(
        FetchError,
      );
    });

    it('throws ValidationError if JSON parsing fails', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(false);
      const mockResponse = {
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as any;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      await expect(fetchConfigFromRepo('username', 'filePath')).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
