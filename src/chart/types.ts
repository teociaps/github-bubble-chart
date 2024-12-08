export interface BubbleData {
  name: string;
  value: number;
  color: string;
  icon?: string;
}

export interface BubbleChartOptions {
  titleOptions: TitleOptions;
  showPercentages?: boolean;
}

export interface TitleOptions {
  text?: string;
  fontSize?: string;
  fontWeight?: string;
  fill?: string;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  [key: string]: any;
}
