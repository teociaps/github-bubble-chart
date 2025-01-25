import { createBubbleChart } from '../../src/chart/generator';
import { LightTheme } from '../../src/chart/themes';
import { describe, it, expect } from 'vitest';
import { BubbleData } from '../../src/chart/types/bubbleData';
import { BubbleChartOptions } from '../../src/chart/types/chartOptions';
import { getCommonStyles, getLegendItemAnimationStyle } from '../../src/chart/styles';
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

    it('should escape special characters in data names', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript & TypeScript', value: 70, color: 'yellow' },
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
      expect(svg).toContain('JavaScript &amp; TypeScript');
    });

    it('should handle invalid width or height', async () => {
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

    it('should create title element if no bubble image is provided', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart', fontSize: '16px', fontWeight: 'bold' } as any,
        showPercentages: true,
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('<text class="bc-title"');
    });

    it('should calculate full height including title and legend', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart', fontSize: '16px', fontWeight: 'bold' } as any,
        showPercentages: true,
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('height="');
    });

    it('should include common styles in the SVG', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
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
      expect(svg).toContain('<style>');
      expect(svg).toContain(getCommonStyles(options.theme));
    });

    it('should include legend if legend options are set to show', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
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
      expect(svg).toContain('<g class="legend"');
    });

    it('should wrap and truncate title text if it exceeds width', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 100,
        height: 400,
        titleOptions: { text: 'An extremely long title that should definitely be wrapped and truncated to fit within the given width of the chart, ensuring that the text handling logic works correctly', fontSize: '16px', fontWeight: 'bold', textAnchor: 'middle' } as any,
        showPercentages: true,
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('<tspan');
      expect(svg).toContain('…');
    });
  });
});
