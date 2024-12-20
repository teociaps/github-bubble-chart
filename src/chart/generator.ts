import { hierarchy, HierarchyCircularNode, max, pack, sum } from 'd3';
import { createCanvas } from 'canvas';
import { createSVGDefs } from './defs.js';
import { BubbleChartOptions, BubbleData, LegendOptions, TitleOptions } from './types.js';
import { getColor, getName, toKebabCase } from './utils.js';
import { getCommonStyles, generateBubbleAnimationStyle, getLegendItemAnimationStyle } from './styles.js';

const titleHeight = 40; // Height reserved for the title text
const maxAnimationOffset = 20; // Maximum offset introduced by the animation

function createTitleElement(
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
  padding: any,
): string {
  const style = Object.keys(titleOptions)
    .filter((style) => style !== 'padding' && style !== 'text' && titleOptions[style] != null)
    .map((style) => `${toKebabCase(style)}: ${titleOptions[style]};`)
    .join(' ');

  return `
    <text class="bc-title"
          x="${width / 2 + (padding.left || 0) - (padding.right || 0)}"
          y="${titleHeight + (padding.top || 0) - (padding.bottom || 0)}"
          style="${style.replaceAll('"', "'")}">
      ${titleOptions.text}
    </text>
  `;
}

function createBubbleElement(
  node: HierarchyCircularNode<BubbleData>,
  index: number,
  totalValue: number,
  chartOptions: BubbleChartOptions,
): string {
  const color = getColor(node.data);
  const radius = node.r;
  const iconUrl = node.data.icon as string;
  const language = node.data.name as string;
  const percentage = ((node.data.value / totalValue) * 100).toFixed(2) + '%';

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
    bubble += `<text class="b-text" dy=".3em" style="font-size: ${radius / 3}px; text-shadow: 0 0 5px ${color};">${getName(node.data)}</text>`;
  }

  // Percentage text
  if (chartOptions.showPercentages) {
    bubble += `<text class="b-percentage" dy="3.5em" style="font-size: ${radius / 4}px;">${percentage}</text>`;
  }

  bubble += '</g>'; // Close the bubble group

  return bubble;
}

function createLegend(data: BubbleData[], totalValue: number, svgWidth: number, svgMaxY: number, legendOptions: LegendOptions): { legendSvg: string; legendHeight: number } {
  const legendMarginTop = 50; // Distance from the last bubble to the legend
  const legendItemHeight = 20; // Height for each legend row
  const legendYPadding = 10; // Vertical padding between rows
  const legendXPadding = 50; // Horizontal spacing between legend items

  let legendY = svgMaxY + legendMarginTop; // Start position for the legend
  let svgLegend = `<g class="legend" transform="translate(0, 0)">`;

  const measureTextWidth = (text: string): number => {
    const canvas = createCanvas(0 ,0);
    const context = canvas.getContext('2d');
    context.font = '12px sans-serif'; // Match SVG font style
    return context.measureText(text).width;
  };

  // Prepare legend items with their measured widths
  const legendItems = data.map((item) => {
    const percentage = ((item.value / totalValue) * 100).toFixed(2) + '%';
    const text = `${item.name} (${percentage})`;
    return {
      text,
      width: measureTextWidth(text) + legendXPadding, // Include circle and padding
      color: item.color
    };
  });

  const rowItems: any[][] = [[]]; // Array of rows, each row contains legend items
  let currentRowWidth = 0;
  let currentRowIndex = 0;

  // Group legend items into rows based on svgWidth
  legendItems.forEach((item) => {
    if (currentRowWidth + item.width > svgWidth) {
      currentRowIndex++;
      rowItems[currentRowIndex] = [];
      currentRowWidth = 0;
    }
    rowItems[currentRowIndex].push(item);
    currentRowWidth += item.width;
  });

  // Generate SVG for legend rows
  rowItems.forEach((row, rowIndex) => {
    let rowWidth = row.reduce((sum, item) => sum + item.width, 0);
    let rowX = 0;

    if (legendOptions.align === 'center') {
      rowX = (svgWidth - rowWidth) / 2;
    } else if (legendOptions.align === 'right') {
      rowX = svgWidth - rowWidth;
    }

    row.forEach((item, itemIndex) => {
      const animationDelay = (rowIndex * row.length + itemIndex) * 0.1;
      svgLegend += `
        <g transform="translate(${rowX}, ${legendY})" class="legend-item" style="animation-delay: ${animationDelay}s;">
          <circle cx="10" cy="15" r="8" fill="${item.color}" />
          <text x="20" y="15">${item.text}</text>
        </g>
      `;
      rowX += item.width; // Next item
    });
    legendY += legendItemHeight + legendYPadding; // Next row
  });

  svgLegend += '</g>';

  // Calculate the total height of the legend element
  const legendHeight = legendY - svgMaxY - legendMarginTop + legendYPadding;

  return { legendSvg: svgLegend, legendHeight };
}

/**
 * Create the SVG element for the bubble chart.
 */
export function createBubbleChart(
  data: BubbleData[],
  chartOptions: BubbleChartOptions
): string | null {
  if (data.length === 0) return null;

  const width = chartOptions.width;
  const height = chartOptions.height;
  const padding = chartOptions.titleOptions.padding || {};
  const baseHeight = height;
  const totalValue = sum(data, (d) => d.value); // Total value for percentage calculation
  const bubblesPack = pack<BubbleData>().size([width, baseHeight]).padding(1.5);
  const root = hierarchy({ children: data } as any).sum((d) => d.value);
  const bubbleNodes = bubblesPack(root).leaves();

  // Calculate adjusted height
  const maxY = max(bubbleNodes, (d) => d.y + d.r + maxAnimationOffset) || baseHeight;
  let adjustedHeight = maxY + titleHeight + (padding.top || 0) + (padding.bottom || 0);

  // Common styles
  let styles = getCommonStyles(chartOptions.theme);

  // Legend
  let legend = '';
  if (chartOptions.legendOptions.show) {
    const legendResult = createLegend(data, totalValue, width, maxY, chartOptions.legendOptions);
    legend = legendResult.legendSvg;
    adjustedHeight += legendResult.legendHeight;
    styles += getLegendItemAnimationStyle();
  }

  // Start building the SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${adjustedHeight}" viewBox="0 0 ${width} ${adjustedHeight}">`;
  svg += createSVGDefs();
  svg += createTitleElement(chartOptions.titleOptions, width, titleHeight, padding);
  svg += `<g transform="translate(0, ${titleHeight + (padding.top || 0)})">`; // TODO: set this more dynamically based on the bubble chart dimensions
  bubbleNodes.forEach((node, index) => {
    svg += createBubbleElement(node, index, totalValue, chartOptions);
    styles += generateBubbleAnimationStyle(node, index);
  });
  svg += '</g>'; // Close bubbles group
  svg += legend; 
  svg += `<style>${styles}</style>`;
  svg += '</svg>';

  return svg;
}
