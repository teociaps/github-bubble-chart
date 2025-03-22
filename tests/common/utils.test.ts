import imageToBase64 from 'image-to-base64';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { themeMap } from '../../src/chart/themes';
import { BubbleChartOptions } from '../../src/chart/types/chartOptions';
import { CustomConfigOptions } from '../../src/chart/types/config';
import {
  isDevEnvironment,
  isProdEnvironment,
} from '../../src/common/environment';
import {
  getPxValue,
  mapConfigToBubbleChartOptions,
  truncateText,
  convertImageToBase64,
} from '../../src/common/utils';

// Mock the imageToBase64 dependency
vi.mock('image-to-base64', () => {
  return {
    default: vi.fn(),
  };
});

// Mock logger to avoid actual logging during tests
vi.mock('../../src/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

// Import the mocked modules for direct access in tests
import logger from '../../src/logger';

describe('Utils Tests', () => {
  it('isDevEnvironment should return true if NODE_ENV is dev', () => {
    process.env.NODE_ENV = 'dev';
    expect(isDevEnvironment()).toBe(true);
  });

  it('isProdEnvironment should return true if NODE_ENV is prod', () => {
    process.env.NODE_ENV = 'prod';
    expect(isProdEnvironment()).toBe(true);
  });

  it('mapConfigToBubbleChartOptions should map config to chart options correctly', () => {
    const config: CustomConfigOptions = {
      width: 600,
      height: 400,
      displayValues: 'all',
      title: {
        text: 'Test Chart',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000',
        align: 'middle',
      },
      legend: {
        show: true,
        align: 'right',
      },
      theme: 'light',
    };
    const expectedOptions: BubbleChartOptions = {
      width: 600,
      height: 400,
      displayValues: 'all',
      usePercentages: false,
      titleOptions: {
        text: 'Test Chart',
        fontSize: '16px',
        fontWeight: 'bold',
        fill: '#000000',
        textAnchor: 'middle',
      },
      legendOptions: {
        show: true,
        align: 'right',
      },
      theme: themeMap.light,
    };
    expect(mapConfigToBubbleChartOptions(config)).toEqual(expectedOptions);
  });

  it('mapConfigToBubbleChartOptions should handle custom theme object', () => {
    const customTheme = {
      textColor: '#123456',
      backgroundColor: '#654321',
      border: {
        color: '#abcdef',
        width: 1,
        rounded: true,
      },
    };
    const config: CustomConfigOptions = {
      width: 600,
      height: 400,
      displayValues: 'all',
      title: {
        text: 'Test Chart',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000',
        align: 'middle',
      },
      legend: {
        show: true,
        align: 'right',
      },
      theme: customTheme,
    };
    const expectedOptions: BubbleChartOptions = {
      width: 600,
      height: 400,
      displayValues: 'all',
      usePercentages: false,
      titleOptions: {
        text: 'Test Chart',
        fontSize: '16px',
        fontWeight: 'bold',
        fill: '#000000',
        textAnchor: 'middle',
      },
      legendOptions: {
        show: true,
        align: 'right',
      },
      theme: customTheme,
    };
    expect(mapConfigToBubbleChartOptions(config)).toEqual(expectedOptions);
  });

  it('mapConfigToBubbleChartOptions should use default theme if name is not found in map', () => {
    const config: CustomConfigOptions = {
      width: 600,
      height: 400,
      displayValues: 'all',
      title: {
        text: 'Test Chart',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#000000',
        align: 'middle',
      },
      legend: {
        show: true,
        align: 'right',
      },
      theme: 'nonexistent_theme',
    };
    const expectedOptions: BubbleChartOptions = {
      width: 600,
      height: 400,
      displayValues: 'all',
      usePercentages: false,
      titleOptions: {
        text: 'Test Chart',
        fontSize: '16px',
        fontWeight: 'bold',
        fill: '#000000',
        textAnchor: 'middle',
      },
      legendOptions: {
        show: true,
        align: 'right',
      },
      theme: themeMap.default,
    };
    expect(mapConfigToBubbleChartOptions(config)).toEqual(expectedOptions);
  });

  it('truncateText should truncate text correctly', () => {
    const text = 'This is a long text that needs to be truncated';
    const truncatedText = truncateText(text, 10);
    expect(truncatedText).toBe('This is a…');
  });

  it('truncateText should not truncate text if it is within the limit', () => {
    const text = 'Short text';
    const truncatedText = truncateText(text, 20);
    expect(truncatedText).toBe('Short text');
  });

  describe('getPxValue', () => {
    it('should return a numeric value for a "px" string', () => {
      expect(getPxValue('15px')).toBe(15);
    });

    it('should return 0 for an empty string or "none"', () => {
      expect(getPxValue('')).toBe(0);
      expect(getPxValue('none')).toBe(0);
    });

    it('should return 0 for unsupported or non-"px" unit types', () => {
      expect(getPxValue('2rem')).toBe(0);
      expect(getPxValue('3em')).toBe(0);
      expect(getPxValue('10pt')).toBe(0);
      expect(getPxValue('100%')).toBe(0);
      expect(getPxValue('10abc')).toBe(0);
    });

    it('should trim whitespace before processing', () => {
      expect(getPxValue(' 20px ')).toBe(20);
    });

    it('should extract numeric value from a border style', () => {
      expect(getPxValue('3px solid red')).toBe(3);
    });
  });

  describe('convertImageToBase64', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(imageToBase64).mockResolvedValue('mockBase64Data');
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should convert PNG image URL to base64 data URL', async () => {
      const pngUrl =
        'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/javascript/javascript.png';
      const result = await convertImageToBase64(pngUrl);
      expect(imageToBase64).toHaveBeenCalledWith(pngUrl);
      expect(result).toBe('data:image/png;base64,mockBase64Data');
    });

    it('should convert JPG image URL to base64 data URL', async () => {
      const jpgUrl =
        'https://www.nasa.gov/wp-content/uploads/2023/03/pia25447-10731.jpg';
      const result = await convertImageToBase64(jpgUrl);
      expect(imageToBase64).toHaveBeenCalledWith(jpgUrl);
      expect(result).toBe('data:image/jpeg;base64,mockBase64Data');
    });

    it('should convert SVG image URL to base64 data URL', async () => {
      const svgUrl =
        'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/android.svg';
      const result = await convertImageToBase64(svgUrl);
      expect(imageToBase64).toHaveBeenCalledWith(svgUrl);
      expect(result).toBe('data:image/svg+xml;base64,mockBase64Data');
    });

    it('should convert GIF image URL to base64 data URL', async () => {
      const gifUrl =
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDUzOGk0M3lvejY5OHgwaHgwZTlrYTc3Z3lsOW12ejl1MTkxMmwwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif';
      const result = await convertImageToBase64(gifUrl);
      expect(imageToBase64).toHaveBeenCalledWith(gifUrl);
      expect(result).toBe('data:image/gif;base64,mockBase64Data');
    });

    it('should convert WebP image URL to base64 data URL', async () => {
      const webpUrl = 'https://www.gstatic.com/webp/gallery/1.webp';
      const result = await convertImageToBase64(webpUrl);
      expect(imageToBase64).toHaveBeenCalledWith(webpUrl);
      expect(result).toBe('data:image/webp;base64,mockBase64Data');
    });

    it('should handle URLs with query parameters correctly', async () => {
      const imageWithParams =
        'https://avatars.githubusercontent.com/u/9919?s=200&v=4';
      const result = await convertImageToBase64(imageWithParams);
      expect(imageToBase64).toHaveBeenCalledWith(imageWithParams);
      expect(result).toBe('data:image/png;base64,mockBase64Data');
    });

    it('should return undefined for invalid URLs', async () => {
      const result = await convertImageToBase64('invalid-url');
      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid URL format'),
        expect.anything(),
      );
    });

    it('should return undefined for null or empty URLs', async () => {
      // @ts-ignore - Testing invalid input
      const result1 = await convertImageToBase64(null);
      const result2 = await convertImageToBase64('');

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(logger.error).toHaveBeenCalledTimes(2);
    });

    it('should handle conversion errors gracefully', async () => {
      vi.mocked(imageToBase64).mockRejectedValue(
        new Error('Conversion failed'),
      );

      const result = await convertImageToBase64(
        'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/nodejs/nodejs.png',
      );

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error converting image to base64'),
        expect.anything(),
      );
    });

    it('should handle timeouts properly', async () => {
      // Mock a delayed response that would trigger the timeout
      vi.mocked(imageToBase64).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('delayed response'), 50);
        });
      });

      const result = await convertImageToBase64(
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        { timeout: 10 },
      );

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Image conversion timed out'),
        expect.anything(),
      );
    });

    it('should use default MIME type for unknown extensions', async () => {
      const noExtensionUrl = 'https://github.githubassets.com/favicons/favicon';
      const result = await convertImageToBase64(noExtensionUrl);
      expect(result).toBe('data:image/png;base64,mockBase64Data');
    });
  });
});
