import { themeMap } from "../chart/themes.js";
import { ConfigOptions, BubbleChartOptions } from "../chart/types.js";

export const isDevEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'dev';
};

export const isProdEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'prod';
};

export function mapConfigToBubbleChartOptions(config: ConfigOptions): BubbleChartOptions {
  const theme = typeof config.theme === 'string' ? themeMap[config.theme.toLowerCase()] : config.theme;
  return {
    width: config.width,
    height: config.height,
    showPercentages: config.showPercentages,
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