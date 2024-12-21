import { ThemeBase } from './themes.js';

// TODO: add setting for legend position (bottom, left, right, top of chart)?

// TODO: add settings for styles customization (3d, flat, shadows, inside a box with borders, more themes, etc..)

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
  showPercentages?: boolean;
  legendOptions: LegendOptions;
  theme: ThemeBase;
}

export interface TitleOptions {
  text?: string;
  fontSize?: string;
  fontWeight?: string;
  fill?: string;
  padding?: { top?: number; right?: number; bottom?: number; left?: number }; // TODO: change this and make only vertical and horizontal with negative values?
  [key: string]: any;
}

export interface LegendOptions {
  show: boolean,
  align: 'left' | 'center' | 'right'
}

interface LanguageMapping {
  color: string;
  icon: string;
}
export type LanguageMappings = Record<string, LanguageMapping>;