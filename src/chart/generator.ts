import { hierarchy, max, pack } from 'd3';
import { createBubbleElement } from './components/bubble.js';
import { createLegend } from './components/legend.js';
import { createSVGDefs } from './defs.js';
import {
  getCommonStyles,
  generateBubbleAnimationStyle,
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
  if (data === undefined || data.length === 0) return null;

  if (isNaN(chartOptions.width) || isNaN(chartOptions.height)) {
    throw new GeneratorError('Invalid width or hight.');
  }

  if (
    chartOptions.titleOptions === undefined ||
    chartOptions.legendOptions === undefined
  ) {
    throw new GeneratorError('Title or legend options are missing.');
  }

  // Escape special characters in data names so they can be shown correctly in the chart
  data.forEach((item) => {
    item.name = escapeSpecialChars(item.name);
  });

  const borderWidth = chartOptions.theme?.border?.width || 0;
  const width = chartOptions.width + borderWidth * 2 + chartPadding * 2;
  const height = chartOptions.height + borderWidth * 2 + chartPadding * 2;

  const bubblesPack = pack<BubbleData>().size([width, height]).padding(1.5);
  const root = hierarchy<BubbleData>({
    children: data,
  } as unknown as BubbleData).sum((d) => d.value);
  const bubbleNodes = bubblesPack(root).leaves();

  // Title
  let titleHeight = 0;
  let { svgTitle, titleLines } = { svgTitle: '', titleLines: 0 };
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

  // Calculate full height
  const bubbleChartMargin = 20; // Space between bubbles and title/legend
  const maxBubbleY =
    max(bubbleNodes, (d) => d.y + d.r + bubbleChartMargin) || height;
  const distanceFromBubbleChart =
    titleHeight * titleLines + bubbleChartMargin + chartPadding;
  let fullHeight = maxBubbleY + distanceFromBubbleChart;

  // Common styles
  let styles = getCommonStyles(chartOptions.theme);

  // Legend
  let svgLegend = '';
  if (
    chartOptions.legendOptions !== undefined &&
    chartOptions.legendOptions.show
  ) {
    const legendResult = await createLegend(
      data,
      width,
      maxBubbleY,
      distanceFromBubbleChart,
      chartOptions,
    );
    svgLegend = legendResult.svgLegend;
    fullHeight += legendResult.legendHeight;
    styles += getLegendItemAnimationStyle();
  }

  // Start building the SVG
  const borderColor = chartOptions.theme?.border?.color || 'transparent';
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${fullHeight}" viewBox="0 0 ${width} ${fullHeight}">`;
  svg += createSVGDefs();
  svg += `<rect class="chart-background" stroke="${borderColor}" stroke-width="${borderWidth}" />`;
  // svg += `<g transform="translate(0, ${borderWidth + chartPadding})">`;
  svg += svgTitle;
  svg += `<g transform="translate(0, ${distanceFromBubbleChart})">`;
  for await (const [index, element] of bubbleNodes.entries()) {
    svg += await createBubbleElement(element, index, chartOptions);
    styles += generateBubbleAnimationStyle(element, index);
  }
  svg += '</g>'; // Close bubbles group
  svg += svgLegend;
  // svg += '</g>'; // Close content group
  svg += `<style>${styles}</style>`;
  svg += '</svg>';

  return svg;
}
