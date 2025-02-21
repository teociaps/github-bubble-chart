import { describe, it, expect } from 'vitest';
import { themeMap } from '../../src/chart/themes';
import { BubbleChartOptions } from '../../src/chart/types/chartOptions';
import { CustomConfigOptions } from '../../src/chart/types/config';
import {
  getPxValue,
  isDevEnvironment,
  isProdEnvironment,
  mapConfigToBubbleChartOptions,
  truncateText,
} from '../../src/common/utils';

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
});
