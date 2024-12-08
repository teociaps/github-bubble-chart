import * as d3 from 'd3';
import { createSVGDefs } from './defs.js';
import { BubbleChartOptions, BubbleData, TitleOptions } from './types.js';
import { getColor, getName, toKebabCase } from './utils.js';
import { JSDOM } from 'jsdom'

// TODO: add settings for bubbles style (3d, flat, shadow, inside a box with borders etc..)

export function setTitle(
  svg: any,
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
  padding: any,
) {
  // SVG title with customizable styles
  const titleElement = svg
    .append('text')
    .attr('class', 'bc-title')
    .attr('x', width / 2 + (padding.left || 0) - (padding.right || 0))
    .attr('y', titleHeight + (padding.top || 0) - (padding.bottom || 0))
    .text(titleOptions.text as string)
    .style('font-family', '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"');

  // Apply the merged styles to the title element
  Object.keys(titleOptions).forEach((style) => {
    if (style !== 'padding') {
      titleElement.style(toKebabCase(style), titleOptions[style]);
    }
  });
}

const defaultTitleOptions: TitleOptions = {
  text: 'Bubble Chart',
  fontSize: '24px',
  fontWeight: 'bold',
  fill: 'black',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  textAnchor: 'middle',
};
const defaultChartOptions: BubbleChartOptions = {
  titleOptions: defaultTitleOptions,
};

const titleHeight = 40; // Height reserved for the title text
const maxAnimationOffset = 20; // Maximum offset introduced by the animation

export const createBubbleChart = (
  data: BubbleData[],
  chartOptions: BubbleChartOptions,
  width: number = 800,
  height: number = 600,
): string | null => {
  if (data.length == 0) return null;

  const mergedChartOptions = { ...defaultChartOptions, ...chartOptions };
  const mergedTitleOptions = { ...defaultTitleOptions, ...chartOptions.titleOptions };
  const padding = mergedTitleOptions.padding || {};

  const baseHeight = height;

  // TODO: remove JSDOM
  // Create a mock DOM with jsdom
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  // global.window = dom.window;
  global.navigator = dom.window.navigator;

  const svg = d3
    .create('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', '100%')
    .attr('viewBox', `0 0 ${width} ${baseHeight + titleHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  createSVGDefs(svg);

  setTitle(svg, mergedTitleOptions, width, titleHeight, padding);

  const bubblesPack = d3.pack<BubbleData>().size([width, baseHeight]).padding(1.5);

  const root = d3.hierarchy({ children: data } as any).sum((d) => d.value);

  const bubbleNodes = bubblesPack(root).leaves();

  const totalValue = d3.sum(data, (d) => d.value); // Calculate total value

  // Find the maximum y-coordinate of the bubbles considering their radii
  const maxY = d3.max(bubbleNodes, (d) => d.y + d.r + maxAnimationOffset) || baseHeight;
  const adjustedHeight = maxY + titleHeight + (padding.top || 0) + (padding.bottom || 0);

  // Update the SVG height and viewBox
  svg.attr('height', adjustedHeight).attr('viewBox', `0 0 ${width} ${adjustedHeight}`);

  const bubbleGroup = svg
    .append('g')
    .attr('transform', `translate(0, ${titleHeight + (padding.top || 0)})`);

  const bubbles = bubbleGroup
    .selectAll()
    .data(bubbleNodes)
    .enter()
    .append('g')
    .attr('class', 'bubble')
    .attr('transform', (d) => `translate(${d.x},${d.y})`);

  // Build each bubble
  bubbles.each(function (d) {
    const bubble = d3.select(this);

    bubble
      .append('ellipse')
      .attr('rx', d.r * 0.6)
      .attr('ry', d.r * 0.3)
      .attr('cx', 0)
      .attr('cy', d.r * -0.6)
      .attr('fill', 'url(#grad--spot)')
      .attr('transform', 'rotate(-45)')
      .attr('class', 'shape');

    bubble
      .append('ellipse')
      .attr('rx', d.r * 0.4)
      .attr('ry', d.r * 0.2)
      .attr('cx', 0)
      .attr('cy', d.r * -0.7)
      .attr('fill', 'url(#grad--spot)')
      .attr('transform', 'rotate(-225)')
      .attr('class', 'shape');

    const iconUrl = d.data.icon as string;
    let color = getColor(d.data);
    // TODO: set auto color based on icon if present

    bubble
      .append('circle')
      .attr('r', d.r)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', color)
      .attr('mask', 'url(#mask--light-bottom)')
      .attr('class', 'shape');

    bubble
      .append('circle')
      .attr('r', d.r)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', 'lightblue')
      .attr('mask', 'url(#mask--light-top)')
      .attr('class', 'shape');

    // node.append('circle')
    //   .attr('r', d => d.r)
    //   .attr('cx', 0)
    //   .attr('cy', 0)
    //   .attr('fill', 'url(#grad)')
    //   .attr('mask', 'url(#mask)')
    //   .attr('class', 'shape');

    if (iconUrl) {
      bubble
        .append('image')
        .attr('xlink:href', iconUrl)
        .attr('width', d.r)
        .attr('height', d.r)
        .attr('x', -d.r / 2)
        .attr('y', -d.r / 2);
    } else {
      bubble
        .append('text')
        .attr('dy', '.3em')
        .attr('text-anchor', 'middle')
        .text(getName(d.data))
        .style('fill', 'white')
        .style('font-size', d.r / 3);
    }

    const percentage = ((d.data.value / totalValue) * 100).toFixed(2) + '%';
    if (mergedChartOptions.showPercentages) {
      bubble
        .append('text')
        .attr('class', 'b-percentage')
        .attr('dy', '3.5em')
        .attr('text-anchor', 'middle')
        .text(percentage)
        .style('fill', 'white')
        .style('font-size', d.r / 4);
    }
  });

  // TODO: make animation for each bubble when appearing
  
  // TODO: choose animation or make it customizable(?)
  
  // function animateBubbles() {
  //   bubbles.each(function (d: any) {
  //     d.xOffset = Math.random() * 2 - 1;
  //     d.yOffset = Math.random() * 2 - 1;
  //     d.angle = Math.random() * 2 * Math.PI;
  //   });

  //   function update() {
  //     bubbles
  //       .transition()
  //       .duration(3000)
  //       .ease(d3.easeLinear)
  //       .attr('transform', (d: any) => {
  //         d.angle += Math.random() * 0.1 - 0.2;
  //         const offsetX = 10 * Math.sin(d.angle) + d.xOffset;
  //         const offsetY = 10 * Math.cos(d.angle) + d.yOffset;
  //         return `translate(${d.x + offsetX},${d.y + offsetY})`;
  //       })
  //       .on('end', function () {
  //         d3.select(this).call(animateBubbles);
  //       });
  //   }

  //   update();
  // }

  // animateBubbles();
  // svg.append('style')
  //   .text(`
  //     @keyframes float {
  //       0% {
  //         transform: translate(0, 0);
  //       }
  //       25% {
  //         transform: translate(15px, -5px);
  //       }
  //       50% {
  //         transform: translate(10px, 10px);
  //       }
  //       75% {
  //         transform: translate(-15px, -5px);
  //       }
  //       100% {
  //         transform: translate(0, 0);
  //       }
  //     }
      
  //     .bubble {
  //       animation: float 3s ease-in-out infinite;
  //       transform-origin: center;
  //     }`)

  return svg.node()?.outerHTML || '';
};
