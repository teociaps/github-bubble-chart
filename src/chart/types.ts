import { ThemeBase } from './themes.js';

// TODO: add setting for legend position (bottom, left, right, top of chart)?

// TODO: add settings for styles customization (3d, flat, gooey, shadows, inside a box with borders, more themes, etc..)

export interface BubbleData {
  name: string;
  value: number;
  color: string;
  icon?: string;
}

export interface BubbleChartOptions {
  width: number; //px
  height: number; //px
  titleOptions: TitleOptions;
  showPercentages: boolean;
  legendOptions: LegendOptions;
  theme: ThemeBase;
}

export interface TitleOptions {
  text: string;
  fontSize: string; //px
  fontWeight: string;
  fill: string;
  textAnchor: TextAnchor;
  [key: string]: any;
}

export interface LegendOptions {
  show: boolean,
  align: TextAlign
}

export type TextAlign = 'left' | 'center' | 'right';
export type TextAnchor = 'start' | 'middle' | 'end';

interface LanguageMapping {
  color: string;
  icon: string;
}
export type LanguageMappings = Record<string, LanguageMapping>;

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