import { ThemeBase } from '../themes.js';
import { BubbleData } from './bubbleData.js';
import { TextAlign, TextAnchor, PercentageDisplay } from './chartOptions.js';

export interface CustomConfig {
  options: CustomConfigOptions;
  data: BubbleData[];
}

export interface CustomConfigOptions {
  width: number;
  height: number;
  showPercentages: PercentageDisplay;
  title: CustomTitleConfig;
  legend: CustomLegendConfig;
  theme: ThemeBase | string;
}

export interface CustomTitleConfig {
  text: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  align: TextAnchor;
}

export interface CustomLegendConfig {
  show: boolean;
  align: TextAlign;
}

export type Mode = 'top-langs' | 'custom-config';
