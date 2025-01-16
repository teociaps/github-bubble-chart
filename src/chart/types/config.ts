import { ThemeBase } from '../themes.js';
import { BubbleData } from './bubbleData.js';
import { TextAlign, TextAnchor } from './chartOptions.js';

export interface CustomConfig {
  options: ConfigOptions;
  data: BubbleData[];
}

export interface ConfigOptions {
  width: number;
  height: number;
  showPercentages: boolean;
  title: TitleConfig;
  legend: LegendConfig;
  theme: ThemeBase | string;
}

export interface TitleConfig {
  text: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  align: TextAnchor;
}

export interface LegendConfig {
  show: boolean;
  align: TextAlign;
}

export type Mode = 'top-langs' | 'custom-config';
