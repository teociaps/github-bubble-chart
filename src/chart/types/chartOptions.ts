import { ThemeBase } from '../themes.js';

export interface BubbleChartOptions {
  width: number; //px
  height: number; //px
  titleOptions: TitleOptions;
  displayValues: DisplayMode;
  usePercentages: boolean;
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

export interface LegendOptions {
  show: boolean;
  align: TextAlign;
}

export type TextAlign = 'left' | 'center' | 'right';
export type TextAnchor = 'start' | 'middle' | 'end';

export type DisplayMode = 'none' | 'all' | 'legend' | 'bubbles';
