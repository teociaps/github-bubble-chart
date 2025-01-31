import { ThemeBase } from '../themes.js';

// TODO: add settings for styles customization (3d, flat, gooey, shadows, inside a box with borders, more themes, etc..)

export interface BubbleChartOptions {
  width: number; //px
  height: number; //px
  titleOptions: TitleOptions;
  showPercentages: PercentageDisplay;
  legendOptions: LegendOptions;
  theme: ThemeBase;
}

export interface TitleOptions {
  text: string;
  fontSize: string; //px
  fontWeight: string;
  fill: string;
  textAnchor: TextAnchor;
  [key: string]: unknown;
}

// TODO: add setting for legend position (bottom, left, right, top of chart)?
export interface LegendOptions {
  show: boolean;
  align: TextAlign;
}

export type TextAlign = 'left' | 'center' | 'right';
export type TextAnchor = 'start' | 'middle' | 'end';

export type PercentageDisplay = 'none' | 'all' | 'legend' | 'bubbles';
