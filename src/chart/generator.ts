import { hierarchy, HierarchyCircularNode, max, pack, sum, svg } from 'd3';
import { createCanvas } from 'canvas';
import { createSVGDefs } from './defs.js';
import { BubbleChartOptions, BubbleData, LegendOptions, TitleOptions } from './types.js';
import { getColor, getName, toKebabCase } from './utils.js';

// TODO: add settings for bubbles style (3d, flat, shadow, inside a box with borders etc..)

const titleHeight = 40; // Height reserved for the title text
const maxAnimationOffset = 20; // Maximum offset introduced by the animation
const defaultFontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"';

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
  showPercentages?: boolean,
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
    bubble += `<image href="${iconUrl}" width="${radius}" height="${radius}" x="${-radius / 2}" y="${-radius / 2}"></image>`;
  } else {
    bubble += `<text dy=".3em" text-anchor="middle" style="fill: white; font-size: ${radius / 3}px;">${getName(node.data)}</text>`;
  }

  // Percentage text
  if (showPercentages) {
    bubble += `<text class="b-percentage" dy="3.5em" text-anchor="middle" style="fill: white; font-size: ${radius / 4}px;">${percentage}</text>`;
  }

  bubble += '</g>'; // Close the bubble group

  // Generate animation style
  const animationStyle = createBubbleAnimation(node, index);

  // Append the animation style
  bubble += `<style>${animationStyle}</style>`;

  return bubble;
}

function createBubbleAnimation(node: any, index: number): string {
  const radius = node.r;
  
  // Randomize animation properties
  const duration = (Math.random() * 5 + 8).toFixed(2); // Between 8s and 13s
  const delay = (Math.random() * 2).toFixed(2); // Between 0s and 2s
  const randomXOffset = Math.random() * 20 - 10; // Random -10 to 10
  const randomYOffset = Math.random() * 20 - 10; // Random -10 to 10
  const plopDelay = radius * 0.010;

  // TODO: make the animation more fluid/smooth + move plop out + make only one style element

  // Define animation keyframes for this bubble
  return `
    .bubble-${index} {
      scale: 0;
      animation: float-${index} ${duration}s ease-in-out infinite ${delay}s, plop 1s ease-out forwards ${plopDelay}s;
      transform-origin: ${node.x}px ${node.y}px;
    }
    @keyframes float-${index} {
      0% {
        transform: translate(${node.x}px, ${node.y}px);
      }
      25% {
        transform: translate(${node.x + randomXOffset}px, ${node.y + randomYOffset}px);
      }
      50% {
        transform: translate(${node.x - randomXOffset}px, ${node.y - randomYOffset}px);
      }
      75% {
        transform: translate(${node.x + randomXOffset / 2}px, ${node.y - randomYOffset / 2}px);
      }
      100% {
        transform: translate(${node.x}px, ${node.y}px);
      }
    }

    @keyframes plop {
      0% {
        scale: 0; /* Start small (invisible) */
      }
      100% {
        scale: 1; /* Scale to full size */
      }
    }
  `;

  // TODO: choose animation or make it customizable(?)
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
      svgLegend += `
        <g transform="translate(${rowX}, ${legendY})" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${(rowIndex * row.length + itemIndex) * 0.2}s" fill="freeze" />
          <circle cx="10" cy="15" r="8" fill="${item.color}" />
          <text x="20" y="15" style="font-size: 12px; text-anchor: start; dominant-baseline: central;">
            ${item.text}
          </text>
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

  // Legend
  let legend = '';
  if (chartOptions.legendOptions.show) {
    const legendResult = createLegend(data, totalValue, width, maxY, chartOptions.legendOptions);
    legend = legendResult.legendSvg;
    adjustedHeight += legendResult.legendHeight;
  }

  // Start building the SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${adjustedHeight}" viewBox="0 0 ${width} ${adjustedHeight}">`;
  svg += createSVGDefs();

  svg += `<style>
      svg {
        font-family: ${defaultFontFamily};
      }
    </style>`

  svg += createTitleElement(chartOptions.titleOptions, width, titleHeight, padding);

  svg += `<g transform="translate(0, ${titleHeight + (padding.top || 0)})">`; // TODO: set this more dynamically based on the bubble chart dimensions
  bubbleNodes.forEach((node, index) => {
    svg += createBubbleElement(node, index, totalValue, chartOptions.showPercentages);
  });
  svg += '</g>'; // Close bubbles group

  svg += legend; // Add the legend
  svg += '</svg>';

  return svg;
}
