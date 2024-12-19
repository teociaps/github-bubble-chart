import { createBubbleChart } from '../../src/chart/generator';
import { BubbleData, BubbleChartOptions } from '../../src/chart/types';
import { LightTheme } from '../../src/chart/themes';

describe('generator', () => {
  describe('createBubbleChart', () => {
    it('should return null if no data is provided', () => {
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' },
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
        titleOptions: { text: 'Test Chart' },
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
