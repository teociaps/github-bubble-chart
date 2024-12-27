import { hierarchy, HierarchyCircularNode, max, pack } from 'd3';
import { createSVGDefs } from './defs.js';
import { BubbleChartOptions, BubbleData, TitleOptions } from './types.js';
import { getColor, getName, measureTextHeight, measureTextWidth, parseEmojis, toKebabCase, wrapText, truncateText, getAlignmentPosition } from './utils.js';
import { getCommonStyles, generateBubbleAnimationStyle, getLegendItemAnimationStyle } from './styles.js';

function createTitleElement(
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
  margin: any,
): { svgTitle: string; titleLines: number } {
  const style = Object.keys(titleOptions)
    .filter((style) => style !== 'margin' && style !== 'text' && style !== 'textAnchor' && titleOptions[style] != null)
    .map((style) => `${toKebabCase(style)}: ${titleOptions[style]};`)
    .join(' ');
  
  const titleAlign = getAlignmentPosition(titleOptions.textAnchor, width);

  titleOptions.text = parseEmojis(titleOptions.text);
  const textWidth = measureTextWidth(titleOptions.text, titleOptions.fontSize);

  let textElement = '';
  let lines: string[] | null = null;
  if (textWidth > width - margin.left) {
    lines = wrapText(titleOptions.text, width - titleAlign, titleOptions.fontSize);
    const linePadding = 10; // Padding between lines

    if (lines.length > 3) {
      lines = lines.slice(0, 3);
      lines[2] = truncateText(lines[2], lines[2].length - 3);
    }

    lines.forEach((line, index) => {
      textElement += `
        <tspan x="${titleAlign + margin.left}" dy="${index === 0 ? 0 : titleHeight + linePadding}">${line}</tspan>
      `;
    });
  } else {
    textElement = titleOptions.text;
  }

  return {
    svgTitle: `
    <text class="bc-title"
          x="${titleAlign + margin.left}"
          y="${titleHeight + margin.top}"
          text-anchor="${titleOptions.textAnchor}"
          style="${style.replaceAll('"', "'")}">
      ${textElement}
    </text>
  `,
    titleLines: lines?.length || 1,
  };
}

function createBubbleElement(
  node: HierarchyCircularNode<BubbleData>,
  index: number,
  chartOptions: BubbleChartOptions,
): string {
  const color = getColor(node.data);
  const radius = node.r;
  const iconUrl = node.data.icon as string;
  const language = getName(node.data);
  const percentage = node.data.value + '%';

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
    const textLines = wrapText(language, radius * 2, fontSize);
    
    let displayedText = '';
    if (textLines.length > 1) {
      const lineHeight = measureTextHeight(language, fontSize);
      const adjustPos = radius / 5;
      textLines.forEach((line, i) => {
        displayedText += `
          <tspan x="0" dy="${i === 0 ? 0 - adjustPos : lineHeight + adjustPos}">${line}</tspan>
        `;
      });
    }
    else {
      displayedText = language;
    }

    bubble += `<text class="b-text" dy=".3em" style="font-size: ${fontSize}; text-shadow: 0 0 5px ${color};">${displayedText}</text>`;
  }

  // Percentage text
  if (chartOptions.showPercentages) {
    bubble += `<text class="b-percentage" dy="3.5em" style="font-size: ${radius / 4}px;">${percentage}</text>`;
  }

  bubble += '</g>'; // Close the bubble group

  return bubble;
}

function createLegend(
  data: BubbleData[],
  svgWidth: number,
  svgMaxY: number,
  distanceFromBubbleChart: number,
  chartOptions: BubbleChartOptions
): { svgLegend: string; legendHeight: number } {
  const legendMarginTop = distanceFromBubbleChart; // Distance from the last bubble to the legend
  const legendItemHeight = 20; // Height for each legend row
  const legendYPadding = 10; // Vertical padding between rows
  const legendXPadding = 50; // Horizontal spacing between legend items

  let legendY = svgMaxY + legendMarginTop; // Start position for the legend
  let svgLegend = `<g class="legend" transform="translate(0, 0)">`;

  // Prepare legend items with their measured widths
  const legendItems = data.map((item) => {
    const percentage = item.value + '%';
    const text = `${item.name} (${percentage})`;
    return {
      text,
      width: measureTextWidth(text, '12px') + legendXPadding, // Include circle and padding
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

  return { svgLegend: svgLegend, legendHeight };
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

  const bubblesPack = pack<BubbleData>().size([width, height]).padding(1.5);
  const root = hierarchy({ children: data } as any).sum((d) => d.value);
  const bubbleNodes = bubblesPack(root).leaves();
  
  // Title
  const titleMargin = chartOptions.titleOptions.margin;
  const titleHeight = measureTextHeight(chartOptions.titleOptions.text, chartOptions.titleOptions.fontSize);
  const { svgTitle, titleLines } = createTitleElement(chartOptions.titleOptions, width, titleHeight, titleMargin);

  // Calculate full height  
  const bubbleChartMargin = 20; // Space between bubbles and title/legend 
  const maxY = max(bubbleNodes, (d) => d.y + d.r + bubbleChartMargin) || height;
  const distanceFromBubbleChart = titleHeight * titleLines + titleMargin.top + bubbleChartMargin;
  let fullHeight = maxY + distanceFromBubbleChart;

  // Common styles
  let styles = getCommonStyles(chartOptions.theme);

  // Legend
  let svgLegend = '';
  if (chartOptions.legendOptions.show) {
    const legendResult = createLegend(data, width, maxY, distanceFromBubbleChart, chartOptions);
    svgLegend = legendResult.svgLegend;
    fullHeight += legendResult.legendHeight;
    styles += getLegendItemAnimationStyle();
  }

  // Start building the SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${fullHeight}" viewBox="0 0 ${width} ${fullHeight}">`;
  svg += createSVGDefs();
  svg += svgTitle;
  svg += `<g transform="translate(0, ${distanceFromBubbleChart})">`;
  bubbleNodes.forEach((node, index) => {
    svg += createBubbleElement(node, index, chartOptions);
    styles += generateBubbleAnimationStyle(node, index);
  });
  svg += '</g>'; // Close bubbles group
  svg += svgLegend; 
  svg += `<style>${styles}</style>`;
  svg += '</svg>';

  return svg;
}
