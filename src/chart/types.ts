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
  margin: { top: number; left: number }; // Negative values allowed for right and bottom
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