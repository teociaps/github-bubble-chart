import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CustomURLSearchParams,
  parseParams,
  fetchConfigFromRepo,
  convertImageToBase64,
} from '../../api/utils';
import { LightTheme } from '../../src/chart/themes';
import { CustomConfig } from '../../src/chart/types/config';
import { isDevEnvironment } from '../../src/common/environment';
import { mapConfigToBubbleChartOptions } from '../../src/common/utils';
import { FetchError, ValidationError } from '../../src/errors/custom-errors';
import {
  GitHubNotFoundError,
  GitHubRateLimitError,
} from '../../src/errors/github-errors';
import logger from '../../src/logger';

describe('API Utils', () => {
  describe('CustomURLSearchParams', () => {
    const testCases = [
      {
        name: 'string value',
        param: 'key=value',
        method: 'getStringValue',
        key: 'key',
        defaultVal: 'default',
        expected: 'value',
      },
      {
        name: 'number value',
        param: 'key=42',
        method: 'getNumberValue',
        key: 'key',
        defaultVal: 0,
        expected: 42,
      },
      {
        name: 'boolean value',
        param: 'key=true',
        method: 'getBooleanValue',
        key: 'key',
        defaultVal: false,
        expected: true,
      },
      {
        name: 'title',
        param: 'title=MyChart',
        method: 'getStringValue',
        key: 'title',
        defaultVal: 'Bubble Chart',
        expected: 'MyChart',
      },
      {
        name: 'legend alignment',
        param: 'legend-align=right',
        method: 'getStringValue',
        key: 'legend-align',
        defaultVal: 'center',
        expected: 'right',
      },
      {
        name: 'title size',
        param: 'title-size=30',
        method: 'getNumberValue',
        key: 'title-size',
        defaultVal: 24,
        expected: 30,
      },
      {
        name: 'title weight',
        param: 'title-weight=normal',
        method: 'getStringValue',
        key: 'title-weight',
        defaultVal: 'bold',
        expected: 'normal',
      },
      {
        name: 'title color',
        param: 'title-color=#ffffff',
        method: 'getStringValue',
        key: 'title-color',
        defaultVal: '#000000',
        expected: '#ffffff',
      },
    ];

    it('should return default values when keys are not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getStringValue('key', 'default')).toBe('default');
      expect(params.getNumberValue('key', 0)).toBe(0);
      expect(params.getBooleanValue('key', true)).toBe(true);
      expect(params.getTheme('theme', new LightTheme())).toBeInstanceOf(
        LightTheme,
      );
      expect(params.getTextAnchorValue('key', 'middle')).toBe('middle');
      expect(params.getLanguagesCount(5)).toBe(5);
      expect(params.getMode()).toBe('top-langs');
      expect(params.getValuesDisplayOption('display-values')).toBe('legend');
    });

    testCases.forEach(({ name, param, method, key, defaultVal, expected }) => {
      it(`should return ${name} if key is present`, () => {
        const params = new CustomURLSearchParams(param);
        expect(params[method](key, defaultVal)).toBe(expected);
      });
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

    it('should handle languages count correctly', () => {
      // Default
      expect(new CustomURLSearchParams('').getLanguagesCount(5)).toBe(5);

      // Valid value
      expect(
        new CustomURLSearchParams('langs-count=10').getLanguagesCount(5),
      ).toBe(10);

      // Too small (should return minimum)
      expect(
        new CustomURLSearchParams('langs-count=0').getLanguagesCount(5),
      ).toBe(1);

      // Too large (should return maximum)
      expect(
        new CustomURLSearchParams('langs-count=21').getLanguagesCount(5),
      ).toBe(20);
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

    // Mode tests - consolidated
    it('should handle mode correctly', () => {
      // Default
      expect(new CustomURLSearchParams('').getMode()).toBe('top-langs');

      // Valid mode
      expect(new CustomURLSearchParams('mode=custom-config').getMode()).toBe(
        'custom-config',
      );

      // Invalid mode (should return default)
      expect(new CustomURLSearchParams('mode=invalid-mode').getMode()).toBe(
        'top-langs',
      );
    });

    it('should handle values display option correctly', () => {
      // Default
      expect(
        new CustomURLSearchParams('').getValuesDisplayOption('display-values'),
      ).toBe('legend');

      // Valid option
      expect(
        new CustomURLSearchParams('display-values=all').getValuesDisplayOption(
          'display-values',
        ),
      ).toBe('all');

      // Invalid option (should return default)
      expect(
        new CustomURLSearchParams(
          'display-values=invalid',
        ).getValuesDisplayOption('display-values'),
      ).toBe('legend');
    });
  });

  describe('parseParams', () => {
    it('should parse URL parameters', () => {
      const req = { url: 'http://example.com?key=value' };
      const params = parseParams(req as Request);
      expect(params.get('key')).toBe('value');
    });

    it('should return empty params if no query string is present', () => {
      const req = { url: 'http://example.com' };
      const params = parseParams(req as Request);
      expect(params.get('key')).toBeNull();
    });
  });

  vi.mock('fs');
  vi.mock('path');
  vi.mock('../../src/common/utils', () => ({
    mapConfigToBubbleChartOptions: vi.fn().mockReturnValue({
      titleOptions: { text: 'Test Chart' },
    }),
    convertImageToBase64: vi.fn().mockImplementation(async (url) => {
      if (url === 'https://example.com/icon.png') {
        return 'data:image/png;base64,converted';
      }
      return undefined;
    }),
  }));
  vi.mock('../../src/common/environment', () => ({
    isDevEnvironment: vi.fn(),
  }));
  vi.stubGlobal('fetch', vi.fn());

  // logger mock to include the warn method
  vi.mock('../../src/logger', () => ({
    default: {
      error: vi.fn(),
      warn: vi.fn(),
    },
  }));

  const mockConfig: CustomConfig = {
    options: {
      titleOptions: { text: 'Test Chart' },
    } as unknown as CustomConfig['options'],
    data: [{ name: 'Node.js', value: 50, color: '#68A063' }] as {
      name: string;
      value: number;
      color: string;
    }[],
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
        data: [{ name: 'Node.js', value: 50, color: '#68A063' }],
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
      } as Response;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      const result = await fetchConfigFromRepo('username', 'filePath');

      expect(result).toEqual({
        options: { titleOptions: { text: 'Test Chart' } },
        data: [{ name: 'Node.js', value: 50, color: '#68A063' }],
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
      const mockResponse = { ok: false, status: 404 } as Response;
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
      } as unknown as Response;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      await expect(fetchConfigFromRepo('username', 'filePath')).rejects.toThrow(
        GitHubRateLimitError,
      );
    });

    it('throws FetchError for other HTTP errors', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(false);
      const mockResponse = { ok: false, status: 500 } as Response;
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
      } as unknown as Response;
      vi.mocked(fetch).mockResolvedValue(mockResponse);

      await expect(fetchConfigFromRepo('username', 'filePath')).rejects.toThrow(
        ValidationError,
      );
    });

    it('handles icon URL conversion cases correctly', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(true);
      const localPath = '/example-config.json';
      vi.mocked(path.resolve).mockReturnValue(localPath);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      // Case 1: Normal conversion
      const configWithIconData = {
        options: { titleOptions: { text: 'Test Chart' } },
        data: [
          {
            name: 'Node.js',
            value: 50,
            color: '#68A063',
            icon: 'https://example.com/icon.png',
          },
          { name: 'Python', value: 30, color: '#3776AB' }, // No icon
        ],
      };

      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify(configWithIconData),
      );
      let result = await fetchConfigFromRepo('username', 'filePath');
      expect(convertImageToBase64).toHaveBeenCalledWith(
        'https://example.com/icon.png',
      );
      expect(result.data[0].icon).toBe('data:image/png;base64,converted');
      expect(result.data[1].icon).toBeUndefined();

      vi.clearAllMocks();

      // Case 2: Already base64 icon
      const configWithBase64IconData = {
        options: { titleOptions: { text: 'Test Chart' } },
        data: [
          {
            name: 'Node.js',
            value: 50,
            color: '#68A063',
            icon: 'data:image/png;base64,alreadyBase64',
          },
        ],
      };

      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify(configWithBase64IconData),
      );
      result = await fetchConfigFromRepo('username', 'filePath');
      expect(convertImageToBase64).not.toHaveBeenCalled();
      expect(result.data[0].icon).toBe('data:image/png;base64,alreadyBase64');

      vi.clearAllMocks();

      // Case 3: Failed conversion
      const configWithBadIconData = {
        options: { titleOptions: { text: 'Test Chart' } },
        data: [
          {
            name: 'Broken',
            value: 50,
            color: '#FF0000',
            icon: 'https://example.com/bad-icon.png',
          },
        ],
      };

      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify(configWithBadIconData),
      );
      result = await fetchConfigFromRepo('username', 'filePath');
      expect(convertImageToBase64).toHaveBeenCalledWith(
        'https://example.com/bad-icon.png',
      );
      expect(result.data[0].icon).toBe('https://example.com/bad-icon.png');
    });

    it('filters out data items with invalid values', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(true);
      const localPath = '/example-config.json';
      vi.mocked(path.resolve).mockReturnValue(localPath);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const configWithInvalidData = {
        options: {
          titleOptions: { text: 'Test Chart' },
        },
        data: [
          { name: 'Valid Number', value: 50, color: '#68A063' }, // Valid
          { name: 'String Value', value: '50', color: '#3776AB' }, // Invalid - string
          { name: 'NaN Value', value: NaN, color: '#FF0000' }, // Invalid - NaN
          { name: 'Undefined Value', value: undefined, color: '#00FF00' }, // Invalid - undefined
          { name: 'Null Value', value: null, color: '#0000FF' }, // Invalid - null
          { name: 'Object Value', value: {}, color: '#FFFF00' }, // Invalid - object
          { name: 'Zero', value: 0, color: '#FF00FF' }, // Valid - zero is a valid number
        ],
      };

      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify(configWithInvalidData),
      );

      const result = await fetchConfigFromRepo('username', 'filePath');

      // Only the valid numeric values should remain
      expect(result.data.length).toBe(2);
      expect(result.data[0].name).toBe('Valid Number');
      expect(result.data[1].name).toBe('Zero');

      // Verify the invalid items were filtered out
      const dataNames = result.data.map((item) => item.name);
      expect(dataNames).not.toContain('String Value');
      expect(dataNames).not.toContain('NaN Value');
      expect(dataNames).not.toContain('Undefined Value');
      expect(dataNames).not.toContain('Null Value');
      expect(dataNames).not.toContain('Object Value');
    });

    it('catches and logs exceptions during icon conversion', async () => {
      vi.mocked(isDevEnvironment).mockReturnValue(true);
      const localPath = '/example-config.json';
      vi.mocked(path.resolve).mockReturnValue(localPath);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const configWithIconData = {
        options: {
          titleOptions: { text: 'Test Chart' },
        },
        data: [
          {
            name: 'Node.js',
            value: 50,
            color: '#68A063',
            icon: 'https://example.com/error-icon.png',
          },
        ],
      };

      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify(configWithIconData),
      );

      // Mock convertImageToBase64 to throw an exception
      vi.mocked(convertImageToBase64).mockImplementation(async (url) => {
        if (url === 'https://example.com/error-icon.png') {
          throw new Error('Conversion error');
        }
        return 'data:image/png;base64,converted';
      });

      const result = await fetchConfigFromRepo('username', 'filePath');

      // Verify the function caught the exception
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to convert icon to base64: https://example.com/error-icon.png',
        expect.any(Error),
      );

      // Verify the original URL is preserved
      expect(result.data[0].icon).toBe('https://example.com/error-icon.png');
    });
  });
});
