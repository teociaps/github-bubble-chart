import { hierarchy, HierarchyCircularNode, max, pack } from 'd3';
import { createSVGDefs } from './defs.js';
import {
  getCommonStyles,
  generateBubbleAnimationStyle,
  getLegendItemAnimationStyle,
  chartPadding,
} from './styles.js';
import { BubbleData } from './types/bubbleData.js';
import { BubbleChartOptions, TitleOptions } from './types/chartOptions.js';
import {
  getColor,
  getName,
  measureTextHeight,
  measureTextWidth,
  parseEmojis,
  toKebabCase,
  wrapText,
  getAlignmentPosition,
  escapeSpecialChars,
} from './utils.js';
import { truncateText } from '../common/utils.js';
import { GeneratorError } from '../errors/custom-errors.js';

async function createTitleElement(
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
): Promise<{ svgTitle: string; titleLines: number }> {
  try {
    const style = Object.keys(titleOptions)
      .filter(
        (style) =>
          style !== 'text' &&
          style !== 'textAnchor' &&
          titleOptions[style] !== null,
      )
      .map((style) => `${toKebabCase(style)}: ${titleOptions[style]};`)
      .join(' ');

    const titleAlign = getAlignmentPosition(titleOptions.textAnchor, width);

    titleOptions.text = escapeSpecialChars(parseEmojis(titleOptions.text));
    const textWidth = await measureTextWidth(
      titleOptions.text,
      titleOptions.fontSize,
      titleOptions.fontWeight,
    );

    let textElement = '';
    let lines: string[] | null = null;
    if (textWidth > width) {
      lines = await wrapText(
        titleOptions.text,
        width,
        titleOptions.fontSize,
        titleOptions.fontWeight,
      );
      const linePadding = 0; // Padding between lines

      if (lines.length > 3) {
        lines = lines.slice(0, 3);
        lines[2] = truncateText(lines[2], lines[2].length - 3);
      }

      lines.forEach((line, index) => {
        textElement += `
          <tspan x="${titleAlign}" dy="${index === 0 ? 0 : titleHeight + linePadding}">${line}</tspan>
        `;
      });
    } else {
      textElement = titleOptions.text;
    }

    return {
      svgTitle: `
      <text class="bc-title"
            x="${titleAlign}"
            y="${titleHeight}"
            text-anchor="${titleOptions.textAnchor}"
            style="${style.replaceAll('"', "'")}">
        ${textElement}
      </text>
    `,
      titleLines: lines?.length || 1,
    };
  } catch (error) {
    throw new GeneratorError(
      'Failed to create title element.',
      error instanceof Error ? error : undefined,
    );
  }
}

async function createBubbleElement(
  node: HierarchyCircularNode<BubbleData>,
  index: number,
  chartOptions: BubbleChartOptions,
): Promise<string> {
  try {
    const color = getColor(node.data);
    const radius = node.r;
    const iconUrl = node.data.icon as string;
    const language = getName(node.data);
    const value = chartOptions.usePercentages
      ? `${node.data.value}%`
      : node.data.value;

    // Main group for the bubble
    let bubble = `<g class="bubble-${index}" transform="translate(${node.x},${node.y})" data-language="${language}">`;

    // Ellipses for 3D effect
    bubble += `
      <ellipse rx="${radius * 0.6}" ry="${radius * 0.3}" cx="0" cy="${radius * -0.6}" fill="url(#grad--spot)" transform="rotate(-45)" class="shape"></ellipse>
      <ellipse rx="${radius * 0.4}" ry="${radius * 0.2}" cx="0" cy="${radius * -0.7}" fill="url(#grad--spot)" transform="rotate(-225)" class="shape"></ellipse>
    `;

    // Circle base
    bubble += `
      <circle r="${radius}" cx="0" cy="0" fill="${color}" mask="url(#mask--light-bottom)" class="shape"></circle>
      <circle r="${radius}" cx="0" cy="0" fill="lightblue" mask="url(#mask--light-top)" class="shape"></circle>
    `;

    // Icon or text inside the bubble
    if (iconUrl) {
      bubble += `<image class="b-icon" href="${iconUrl}" width="${radius}" height="${radius}" x="${-radius / 2}" y="${-radius / 2}"></image>`;
    } else {
      const fontSize = radius / 3 + 'px';
      const textLines = await wrapText(language, radius * 2, fontSize);

      let displayedText = '';
      if (textLines.length > 1) {
        const lineHeight = await measureTextHeight(language, fontSize);
        const adjustPos = radius / 5;
        textLines.forEach((line, i) => {
          displayedText += `
            <tspan x="0" dy="${i === 0 ? 0 - adjustPos : lineHeight + adjustPos}">${line}</tspan>
          `;
        });
      } else {
        displayedText = language;
      }

      bubble += `<text class="b-text" dy=".3em" style="font-size: ${fontSize}; text-shadow: 0 0 5px ${color};">${displayedText}</text>`;
    }

    // Value text
    if (
      chartOptions.displayValues === 'all' ||
      chartOptions.displayValues === 'bubbles'
    ) {
      bubble += `<text class="b-value" dy="3.5em" style="font-size: ${radius / 4}px;">${value}</text>`;
    }

    bubble += '</g>'; // Close the bubble group

    return bubble;
  } catch (error) {
    throw new GeneratorError(
      'Failed to create bubble element.',
      error instanceof Error ? error : undefined,
    );
  }
}

async function createLegend(
  data: BubbleData[],
  svgWidth: number,
  svgMaxY: number,
  distanceFromBubbleChart: number,
  chartOptions: BubbleChartOptions,
): Promise<{ svgLegend: string; legendHeight: number }> {
  try {
    const legendMarginTop = distanceFromBubbleChart; // Distance from the last bubble to the legend
    const legendItemHeight = 20; // Height for each legend row
    const legendYPadding = 10; // Vertical padding between rows
    const legendXPadding = 50; // Horizontal spacing between legend items

    let legendY = svgMaxY + legendMarginTop; // Start position for the legend
    let svgLegend = `<g class="legend" transform="translate(0, 0)">`;

    // Prepare legend items with their measured widths
    const legendItems = data.map(async (item) => {
      const value =
        chartOptions.displayValues === 'all' ||
        chartOptions.displayValues === 'legend'
          ? chartOptions.usePercentages
            ? ` (${item.value}%)`
            : ` (${item.value})`
          : '';
      const text = `${item.name}${value}`;
      const textWidth = await measureTextWidth(text, '12px');
      return {
        text,
        width: textWidth + legendXPadding, // Include circle and padding
        color: item.color,
      };
    });

    const rowItems: { text: string; width: number; color: string }[][] = [[]]; // Array of rows, each row contains legend items
    let currentRowWidth = 0;
    let currentRowIndex = 0;

    // Group legend items into rows based on svgWidth
    for await (const i of legendItems) {
      if (currentRowWidth + i.width > svgWidth) {
        currentRowIndex++;
        rowItems[currentRowIndex] = [];
        currentRowWidth = 0;
      }
      rowItems[currentRowIndex].push(i);
      currentRowWidth += i.width;
    }

    // Generate SVG for legend rows
    rowItems.forEach((row, rowIndex) => {
      const rowWidth = row.reduce((sum, item) => sum + item.width, 0);
      let rowX = 0;

      if (chartOptions.legendOptions.align === 'center') {
        rowX = (svgWidth - rowWidth) / 2;
      } else if (chartOptions.legendOptions.align === 'right') {
        rowX = svgWidth - rowWidth;
      }

      row.forEach((item, itemIndex) => {
        const animationDelay = (rowIndex * row.length + itemIndex) * 0.1;
        svgLegend += `
          <g transform="translate(${rowX}, ${legendY})" class="legend-item" style="animation-delay: ${animationDelay}s;">
            <circle cx="10" cy="15" r="8" fill="${item.color}" />
            <text x="22" y="15">${item.text}</text>
          </g>
        `;
        rowX += item.width; // Next item
      });
      legendY += legendItemHeight + legendYPadding; // Next row
    });

    svgLegend += '</g>';

    // Calculate the total height of the legend element
    const legendHeight = legendY - svgMaxY - legendMarginTop + legendYPadding;

    return { svgLegend: svgLegend, legendHeight };
  } catch (error) {
    throw new GeneratorError(
      'Failed to create legend.',
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Create the SVG element for the bubble chart.
 */
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

  const width = chartOptions.width;
  const height = chartOptions.height;

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
  const maxY = max(bubbleNodes, (d) => d.y + d.r + bubbleChartMargin) || height;
  const distanceFromBubbleChart = titleHeight * titleLines + bubbleChartMargin;
  let fullHeight = maxY + distanceFromBubbleChart;

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
      maxY,
      distanceFromBubbleChart,
      chartOptions,
    );
    svgLegend = legendResult.svgLegend;
    fullHeight += legendResult.legendHeight;
    styles += getLegendItemAnimationStyle();
  }

  // Start building the SVG
  const borderPx = chartOptions.theme?.border?.width || 0;
  const borderColor = chartOptions.theme?.border?.color || 'transparent';
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width + borderPx * 2 + chartPadding * 2}" height="${fullHeight + borderPx * 2 + chartPadding * 2}" viewBox="0 0 ${width + borderPx * 2 + chartPadding * 2} ${fullHeight + borderPx * 2 + chartPadding * 2}">`;
  svg += createSVGDefs();
  svg += `<rect class="chart-background" stroke="${borderColor}" stroke-width="${borderPx}" />`;
  svg += `<g transform="translate(${borderPx + chartPadding}, ${borderPx + chartPadding})">`;
  svg += svgTitle;
  svg += `<g transform="translate(0, ${distanceFromBubbleChart})">`;
  for await (const [index, element] of bubbleNodes.entries()) {
    svg += await createBubbleElement(element, index, chartOptions);
    styles += generateBubbleAnimationStyle(element, index);
  }
  svg += '</g>'; // Close bubbles group
  svg += svgLegend;
  svg += '</g>'; // Close content group
  svg += `<style>${styles}</style>`;
  svg += '</svg>';

  return svg;
}
