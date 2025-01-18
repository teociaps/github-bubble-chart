import { createBubbleChart } from '../../src/chart/generator';
import { LightTheme } from '../../src/chart/themes';
import { describe, it, expect } from 'vitest';
import { BubbleData } from '../../src/chart/types/bubbleData';
import { BubbleChartOptions } from '../../src/chart/types/chartOptions';

describe('Generator', () => {
  describe('createBubbleChart', () => {
    it('should return null if no data is provided', () => {
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as any,
        showPercentages: false,
        legendOptions: { show: false, align: 'left' },
        theme: new LightTheme(),
      };
      expect(createBubbleChart([], options)).toBeNull();
    });

    it('should generate SVG string for bubble chart', () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
        { name: 'TypeScript', value: 30, color: 'blue' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as any,
        showPercentages: true,
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = createBubbleChart(data, options);
      expect(svg).toContain('<svg');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('TypeScript');
    });
  });
});
