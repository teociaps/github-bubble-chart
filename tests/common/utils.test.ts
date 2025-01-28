import { describe, it, expect } from 'vitest';
import {
  isDevEnvironment,
  isProdEnvironment,
  mapConfigToBubbleChartOptions,
  truncateText,
} from '../../src/common/utils';
import { themeMap } from '../../src/chart/themes';
import { ConfigOptions } from '../../src/chart/types/config';
import { BubbleChartOptions } from '../../src/chart/types/chartOptions';

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
    const config: ConfigOptions = {
      width: 600,
      height: 400,
      showPercentages: true,
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
      showPercentages: true,
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
});
