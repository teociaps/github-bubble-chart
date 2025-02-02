import { describe, it, expect } from 'vitest';
import { createBubbleChart } from '../../src/chart/generator';
import {
  getCommonStyles,
  getLegendItemAnimationStyle,
} from '../../src/chart/styles';
import { LightTheme, ThemeBase } from '../../src/chart/themes';
import { BubbleData } from '../../src/chart/types/bubbleData';
import {
  BubbleChartOptions,
  LegendOptions,
  TitleOptions,
} from '../../src/chart/types/chartOptions';
import { GeneratorError, StyleError } from '../../src/errors/custom-errors';

describe('Generator', () => {
  describe('createBubbleChart', () => {
    it('should return null if no data is provided', async () => {
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'none',
        legendOptions: { show: false, align: 'left' },
        theme: new LightTheme(),
      };
      const result = await createBubbleChart([], options);
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
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
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
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      await expect(createBubbleChart(data, options)).rejects.toThrow(
        GeneratorError,
      );
    });

    it('should escape special characters in data names', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript & TypeScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
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
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      await expect(createBubbleChart(data, options)).rejects.toThrow(
        GeneratorError,
      );
    });

    it('should create title element if no bubble image is provided', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: {
          text: 'Test Chart',
          fontSize: '16px',
          fontWeight: 'bold',
        } as TitleOptions,
        showPercentages: 'all',
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
        titleOptions: {
          text: 'Test Chart',
          fontSize: '16px',
          fontWeight: 'bold',
        } as TitleOptions,
        showPercentages: 'all',
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
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
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
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
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
        titleOptions: {
          text: 'An extremely long title that should definitely be wrapped and truncated to fit within the given width of the chart, ensuring that the text handling logic works correctly',
          fontSize: '16px',
          fontWeight: 'bold',
          textAnchor: 'middle',
        } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('<tspan');
      expect(svg).toContain('…');
    });

    it('should not show percentages when showPercentages is None', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 50, color: '#f1e05a' },
        { name: 'Python', value: 30, color: '#3572A5' },
        { name: 'Java', value: 20, color: '#b07219' },
      ];

      const chartOptions: BubbleChartOptions = {
        width: 800,
        height: 600,
        titleOptions: {
          text: 'Programming Languages',
          fontSize: '24px',
          fontWeight: 'bold',
          fill: '#000',
          textAnchor: 'middle',
        },
        showPercentages: 'none',
        legendOptions: {
          show: true,
          align: 'center',
        },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, chartOptions);
      expect(svg).not.toContain('class="b-percentage"'); // HTML element
      expect(svg).not.toContain('(50%)');
    });

    it('should show percentages in both bubbles and legend when showPercentages is All', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 50, color: '#f1e05a' },
        { name: 'Python', value: 30, color: '#3572A5' },
        { name: 'Java', value: 20, color: '#b07219' },
      ];

      const chartOptions: BubbleChartOptions = {
        width: 800,
        height: 600,
        titleOptions: {
          text: 'Programming Languages',
          fontSize: '24px',
          fontWeight: 'bold',
          fill: '#000',
          textAnchor: 'middle',
        },
        showPercentages: 'all',
        legendOptions: {
          show: true,
          align: 'center',
        },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, chartOptions);
      expect(svg).toContain('b-percentage');
      expect(svg).toContain('(50%)');
    });

    it('should show percentages only in legend when showPercentages is Legend', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 50, color: '#f1e05a' },
        { name: 'Python', value: 30, color: '#3572A5' },
        { name: 'Java', value: 20, color: '#b07219' },
      ];

      const chartOptions: BubbleChartOptions = {
        width: 800,
        height: 600,
        titleOptions: {
          text: 'Programming Languages',
          fontSize: '24px',
          fontWeight: 'bold',
          fill: '#000',
          textAnchor: 'middle',
        },
        showPercentages: 'legend',
        legendOptions: {
          show: true,
          align: 'center',
        },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, chartOptions);
      expect(svg).not.toContain('class="b-percentage"'); // HTML element
      expect(svg).toContain('(50%)');
    });

    it('should show percentages only in bubbles when showPercentages is Bubbles', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 50, color: '#f1e05a' },
        { name: 'Python', value: 30, color: '#3572A5' },
        { name: 'Java', value: 20, color: '#b07219' },
      ];

      const chartOptions: BubbleChartOptions = {
        width: 800,
        height: 600,
        titleOptions: {
          text: 'Programming Languages',
          fontSize: '24px',
          fontWeight: 'bold',
          fill: '#000',
          textAnchor: 'middle',
        },
        showPercentages: 'bubbles',
        legendOptions: {
          show: true,
          align: 'center',
        },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, chartOptions);
      expect(svg).toContain('b-percentage');
      expect(svg).not.toContain('(50%)');
    });
  });

  describe('createBubbleChart missing data', () => {
    it('should handle missing title text', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: '' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).not.toContain('<text class="bc-title"');
    });

    it('should throw GeneratorError if legend options are missing', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: undefined as unknown as LegendOptions,
        theme: new LightTheme(),
      };
      await expect(createBubbleChart(data, options)).rejects.toThrow(
        GeneratorError,
      );
    });

    it('should throw GeneratorError if title options are missing', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
        titleOptions: undefined as unknown as TitleOptions,
      };
      await expect(createBubbleChart(data, options)).rejects.toThrow(
        GeneratorError,
      );
    });

    it('should handle missing theme', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: undefined as unknown as ThemeBase,
      };
      await expect(createBubbleChart(data, options)).rejects.toThrow(
        StyleError,
      );
    });

    it('should handle missing bubble data', async () => {
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(undefined as unknown as [], options);
      expect(svg).toBeNull();
    });

    it('should handle missing bubble icon', async () => {
      const data: BubbleData[] = [
        { name: 'JavaScript', value: 70, color: 'yellow' },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('<text class="b-text"');
    });

    it('should handle missing bubble color', async () => {
      const data: BubbleData[] = [
        {
          name: 'JavaScript',
          value: 70,
          color: undefined as unknown as string,
        },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('<circle');
    });

    it('should handle missing bubble value', async () => {
      const data: BubbleData[] = [
        {
          name: 'JavaScript',
          color: 'yellow',
          value: undefined as unknown as number,
        },
      ];
      const options: BubbleChartOptions = {
        width: 600,
        height: 400,
        titleOptions: { text: 'Test Chart' } as TitleOptions,
        showPercentages: 'all',
        legendOptions: { show: true, align: 'center' },
        theme: new LightTheme(),
      };
      const svg = await createBubbleChart(data, options);
      expect(svg).toContain('<circle');
    });
  });
});
