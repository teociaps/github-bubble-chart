import { hierarchy, HierarchyCircularNode, max, pack } from 'd3';
import { processBubbleNodes } from './components/bubbles.js';
import { createLegend } from './components/legend.js';
import { createSVGDefs } from './defs.js';
import {
  getCommonStyles,
  getLegendItemAnimationStyle,
  chartPadding,
} from './styles.js';
import { BubbleData } from './types/bubbleData.js';
import { BubbleChartOptions } from './types/chartOptions.js';
import { escapeSpecialChars, measureTextHeight } from './utils.js';
import { GeneratorError } from '../errors/custom-errors.js';
import { createTitleElement } from './components/title.js';

export async function createBubbleChart(
  data: BubbleData[],
  chartOptions: BubbleChartOptions,
): Promise<string | null> {
  if (!isValidData(data, chartOptions)) return null;

  const { width, height, borderWidth } = calculateDimensions(chartOptions);

  const bubbleNodes = generateBubbleNodes(data, width, height);
  const { svgTitle, titleHeight, titleLines } = await generateTitle(
    chartOptions,
    width,
  );

  const { fullHeight, maxBubbleY, distanceFromBubbleChart } =
    calculateFullHeight(bubbleNodes, titleHeight, titleLines);

  let styles = getCommonStyles(chartOptions.theme);
  const { svgLegend, legendHeight } = await generateLegend(
    data,
    width,
    maxBubbleY,
    distanceFromBubbleChart,
    chartOptions,
  );
  styles += getLegendItemAnimationStyle(chartOptions.theme);

  const svg = await buildSVG({
    width,
    fullHeight: fullHeight + legendHeight,
    borderWidth,
    borderColor: chartOptions.theme?.border?.color || 'transparent',
    svgTitle,
    distanceFromBubbleChart,
    bubbleNodes,
    chartOptions,
    svgLegend,
    styles,
  });

  return svg;
}

function isValidData(
  data: BubbleData[],
  chartOptions: BubbleChartOptions,
): boolean {
  if (data === undefined || data.length === 0) return false;

  if (isNaN(chartOptions.width) || isNaN(chartOptions.height)) {
    throw new GeneratorError('Invalid width or height.');
  }

  if (!chartOptions.titleOptions || !chartOptions.legendOptions) {
    throw new GeneratorError('Title or legend options are missing.');
  }

  data.forEach((item) => {
    item.name = escapeSpecialChars(item.name);
  });

  return true;
}

function calculateDimensions(chartOptions: BubbleChartOptions): {
  width: number;
  height: number;
  borderWidth: number;
} {
  const borderWidth = chartOptions.theme?.border?.width || 0;
  const width = chartOptions.width + borderWidth * 2 + chartPadding * 2;
  const height = chartOptions.height + borderWidth * 2 + chartPadding * 2;
  return { width, height, borderWidth };
}

function generateBubbleNodes(
  data: BubbleData[],
  width: number,
  height: number,
): HierarchyCircularNode<BubbleData>[] {
  const bubblesPack = pack<BubbleData>().size([width, height]).padding(1.5);
  const root = hierarchy<BubbleData>({
    children: data,
  } as unknown as BubbleData).sum((d) => d.value);
  return bubblesPack(root).leaves();
}

async function generateTitle(
  chartOptions: BubbleChartOptions,
  width: number,
): Promise<{ svgTitle: string; titleHeight: number; titleLines: number }> {
  let titleHeight = 0;
  let svgTitle = '';
  let titleLines = 0;
  if (chartOptions.titleOptions.text) {
    titleHeight = await measureTextHeight(
      chartOptions.titleOptions.text,
      chartOptions.titleOptions.fontSize,
      chartOptions.titleOptions.fontWeight,
    );
    const title = await createTitleElement(
      chartOptions.titleOptions,
      width,
      titleHeight,
    );
    svgTitle = title.svgTitle;
    titleLines = title.titleLines;
  }
  return { svgTitle, titleHeight, titleLines };
}

function calculateFullHeight(
  bubbleNodes: HierarchyCircularNode<BubbleData>[],
  titleHeight: number,
  titleLines: number,
): { fullHeight: number; maxBubbleY: number; distanceFromBubbleChart: number } {
  const bubbleChartMargin = 20; // Space between bubbles and title/legend
  const maxBubbleY =
    max(bubbleNodes, (d) => d.y + d.r + bubbleChartMargin) || 0;
  const distanceFromBubbleChart =
    titleHeight * titleLines + bubbleChartMargin + chartPadding;
  const fullHeight = maxBubbleY + distanceFromBubbleChart;
  return { fullHeight, maxBubbleY, distanceFromBubbleChart };
}

async function generateLegend(
  data: BubbleData[],
  width: number,
  maxBubbleY: number,
  distanceFromBubbleChart: number,
  chartOptions: BubbleChartOptions,
): Promise<{ svgLegend: string; legendHeight: number }> {
  let svgLegend = '';
  let legendHeight = 0;
  if (chartOptions.legendOptions?.show) {
    const legendResult = await createLegend(
      data,
      width,
      maxBubbleY,
      distanceFromBubbleChart,
      chartOptions,
    );
    svgLegend = legendResult.svgLegend;
    legendHeight = legendResult.legendHeight;
  }
  return { svgLegend, legendHeight };
}

async function buildSVG({
  width,
  fullHeight,
  borderWidth,
  borderColor,
  svgTitle,
  distanceFromBubbleChart,
  bubbleNodes,
  chartOptions,
  svgLegend,
  styles,
}: {
  width: number;
  fullHeight: number;
  borderWidth: number;
  borderColor: string;
  svgTitle: string;
  distanceFromBubbleChart: number;
  bubbleNodes: HierarchyCircularNode<BubbleData>[];
  chartOptions: BubbleChartOptions;
  svgLegend: string;
  styles: string;
}): Promise<string> {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${fullHeight}" viewBox="0 0 ${width} ${fullHeight}">`;
  svg += createSVGDefs();
  svg += `<rect class="chart-background" stroke="${borderColor}" stroke-width="${borderWidth}" />`;
  svg += svgTitle;
  svg += `<g transform="translate(0, ${distanceFromBubbleChart})">`;
  const { bubbleElements, bubbleStyles } = await processBubbleNodes(
    bubbleNodes,
    chartOptions,
  );
  svg += bubbleElements;
  styles += bubbleStyles;
  svg += '</g>'; // Close bubbles group
  svg += svgLegend;
  svg += `<style>${styles}</style>`;
  svg += '</svg>';
  return svg;
}
