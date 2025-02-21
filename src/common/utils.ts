import { themeMap } from '../chart/themes.js';
import { BubbleChartOptions } from '../chart/types/chartOptions.js';
import { CustomConfigOptions } from '../chart/types/config.js';

export const isDevEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'dev';
};

export const isProdEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'prod';
};

export function mapConfigToBubbleChartOptions(
  config: CustomConfigOptions,
): BubbleChartOptions {
  const theme =
    typeof config.theme === 'string'
      ? themeMap[config.theme.toLowerCase()] || themeMap.default
      : config.theme;
  return {
    width: config.width,
    height: config.height,
    displayValues: config.displayValues,
    usePercentages: false,
    titleOptions: {
      text: config.title.text,
      fontSize: config.title.fontSize,
      fontWeight: config.title.fontWeight,
      fill: config.title.color,
      textAnchor: config.title.align,
    },
    legendOptions: {
      show: config.legend.show,
      align: config.legend.align,
    },
    theme: theme,
  };
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length > maxChars) {
    return text.substring(0, maxChars - 1) + '…';
  }
  return text;
}

export function getPxValue(value: string): number {
  if (!value || value === 'none') return 0;
  const pxMatch = value.match(/(\d+(\.\d+)?)(px)/);
  if (pxMatch) {
    return parseFloat(pxMatch[1]);
  }
  return 0;
}
