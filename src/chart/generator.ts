import { hierarchy, max, pack, sum } from 'd3';
import { createSVGDefs } from './defs.js';
import { BubbleChartOptions, BubbleData, TitleOptions } from './types.js';
import { getColor, getName, toKebabCase } from './utils.js';

// TODO: add settings for bubbles style (3d, flat, shadow, inside a box with borders etc..)

export function setTitle(
  svg: string,
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
  padding: any,
): string {
  const style = Object.keys(titleOptions)
    .filter((style) => style !== 'padding' && style !== 'text' && titleOptions[style] != null)
    .map((style) => {
      const value = titleOptions[style];
      if (value === null || value === undefined) return '';
      return `${toKebabCase(style)}: ${value};`;
    })
    .filter((style) => style)
    .join(' ');

  // Create the title element as a string with dynamic styles
  const titleElement = `
    <text class="bc-title"
          x="${width / 2 + (padding.left || 0) - (padding.right || 0)}"
          y="${titleHeight + (padding.top || 0) - (padding.bottom || 0)}"
          style="${style.replaceAll('"', "'")}">
      ${titleOptions.text}
    </text>
  `;

  return titleElement;
}

const defaultTitleOptions: TitleOptions = {
  text: 'Bubble Chart',
  fontSize: '24px',
  fontWeight: 'bold',
  fill: 'black',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  textAnchor: 'middle',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
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

  // Directly generate the SVG string instead of using jsdom
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${
    baseHeight + titleHeight
  }" preserveAspectRatio="xMidYMid meet">`;

  // Create the definitions part
  svg += createSVGDefs();

  svg += setTitle(svg, mergedTitleOptions, width, titleHeight, padding);

  const bubblesPack = pack<BubbleData>().size([width, baseHeight]).padding(1.5);
  const root = hierarchy({ children: data } as any).sum((d) => d.value);
  const bubbleNodes = bubblesPack(root).leaves();

  const totalValue = sum(data, (d) => d.value); // Calculate total value

  // Find the maximum y-coordinate of the bubbles considering their radii
  const maxY = max(bubbleNodes, (d) => d.y + d.r + maxAnimationOffset) || baseHeight;
  const adjustedHeight = maxY + titleHeight + (padding.top || 0) + (padding.bottom || 0);

  // Update the SVG height and viewBox
  svg = svg.replace(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${
      baseHeight + titleHeight
    }" preserveAspectRatio="xMidYMid meet">`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${adjustedHeight}" preserveAspectRatio="xMidYMid meet">`,
  );

  // Create bubble elements
  svg += `<g transform="translate(0, ${titleHeight + (padding.top || 0)})">`;

  // Build each bubble
  bubbleNodes.forEach(function (d) {
    let color = getColor(d.data);

    // Add bubble shape
    svg += `<g class="bubble" transform="translate(${d.x},${d.y})">
              <ellipse rx="${d.r * 0.6}" ry="${d.r * 0.3}" cx="0" cy="${
      d.r * -0.6
    }" fill="url(#grad--spot)" transform="rotate(-45)" class="shape"></ellipse>
              <ellipse rx="${d.r * 0.4}" ry="${d.r * 0.2}" cx="0" cy="${
      d.r * -0.7
    }" fill="url(#grad--spot)" transform="rotate(-225)" class="shape"></ellipse>
              <circle r="${
                d.r
              }" cx="0" cy="0" fill="${color}" mask="url(#mask--light-bottom)" class="shape"></circle>
              <circle r="${
                d.r
              }" cx="0" cy="0" fill="lightblue" mask="url(#mask--light-top)" class="shape"></circle>`;

    const iconUrl = d.data.icon as string;
    if (iconUrl) {
      svg += `<image href="${iconUrl}" width="${d.r}" height="${d.r}" x="${-d.r / 2}" y="${
        -d.r / 2
      }"></image>`;
    } else {
      svg += `<text dy=".3em" text-anchor="middle" style="fill: white; font-size: ${
        d.r / 3
      }px;">${getName(d.data)}</text>`;
    }

    const percentage = ((d.data.value / totalValue) * 100).toFixed(2) + '%';
    if (mergedChartOptions.showPercentages) {
      svg += `<text class="b-percentage" dy="3.5em" text-anchor="middle" style="fill: white; font-size: ${
        d.r / 4
      }px;">${percentage}</text>`;
    }

    svg += `</g>`; // Close bubble group
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

  svg += `</g>`; // Close main group

  svg += `</svg>`; // Close SVG

  return svg || '';
};
