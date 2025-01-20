import { createBubbleChart } from '../../src/chart/generator';
import { LightTheme } from '../../src/chart/themes';
import { describe, it, expect } from 'vitest';
import { BubbleData } from '../../src/chart/types/bubbleData';
import { BubbleChartOptions } from '../../src/chart/types/chartOptions';
import { getCommonStyles, generateBubbleAnimationStyle, getLegendItemAnimationStyle } from '../../src/chart/styles';
import { GeneratorError } from '../../src/errors/custom-errors';

describe('Generator', () => {
  describe('createBubbleChart', () => {
    it('should return null if no data is provided', async () => {
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as any,
        showPercentages: false,
        legendOptions: { show: false, align: 'left' },
        theme: new LightTheme(),
      };
      var result = await createBubbleChart([], options);
      expect(result).toBeNull();
    });

    it('should generate SVG string for bubble chart', async () => {
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
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('<svg');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('TypeScript');
      expect(svg).toContain(getCommonStyles(options.theme));
      expect(svg).toContain(getLegendItemAnimationStyle());
      data.forEach((_, index) => {
        expect(svg).toContain(`.bubble-${index}`);
        expect(svg).toContain(`@keyframes float-${index}`);
      });
    });

    it('should throw GeneratorError if bubble creation fails', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: NaN,
        height: 400,
        titleOptions: { text: 'Test Chart' } as any,
        showPercentages: true,
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      await expect(createBubbleChart(data, options)).rejects.toThrow(GeneratorError);
    });
  });
});
