export const createSVGDefs = (): string => {
  const createRadialGradient = (
    id: string,
    coordinates: { fx: string; fy: string },
    stops: { offset: string; color: string; opacity?: number }[],
  ) => {
    let gradient = `<radialGradient id="${id}" fx="${coordinates.fx}" fy="${coordinates.fy}">`;
    stops.forEach((stop) => {
      gradient += `<stop offset="${stop.offset}" stop-color="${stop.color}" ${
        stop.opacity !== null || undefined ? `stop-opacity="${stop.opacity}"` : ''
      }></stop>`;
    });
    gradient += `</radialGradient>`;
    return gradient;
  };

  const createMask = (id: string, gradientId: string, transform?: string) => {
    return `
      <mask id="${id}" maskContentUnits="objectBoundingBox">
        <rect fill="url(#${gradientId})" width="1" height="1" ${
      transform !== null || undefined ? `transform="${transform}"` : ''
    }></rect>
      </mask>
    `;
  };

  let svgDefs = '<defs xmlns="http://www.w3.org/2000/svg">';

  svgDefs += createRadialGradient('grad--bw', { fx: '25%', fy: '25%' }, [
    { offset: '0%', color: 'black' },
    { offset: '30%', color: 'black', opacity: 0.2 },
    { offset: '97%', color: 'white', opacity: 0.4 },
    { offset: '100%', color: 'black' },
  ]);

  svgDefs += createRadialGradient('grad--spot', { fx: '50%', fy: '20%' }, [
    { offset: '10%', color: 'white', opacity: 0.7 },
    { offset: '70%', color: 'white', opacity: 0 },
  ]);

  svgDefs += createRadialGradient('grad--bw-light', { fx: '25%', fy: '10%' }, [
    { offset: '60%', color: 'black', opacity: 0 },
    { offset: '90%', color: 'white', opacity: 0.25 },
    { offset: '100%', color: 'black' },
  ]);

  svgDefs += createMask('mask', 'grad--bw');
  svgDefs += createMask('mask--light-top', 'grad--bw-light', 'rotate(180, .5, .5)');
  svgDefs += createMask('mask--light-bottom', 'grad--bw-light');

  svgDefs += `
    <linearGradient id="grad" x1="0" y1="100%" x2="100%" y2="0">
      <stop offset="0" stop-color="dodgerblue"></stop>
      <stop offset="50%" stop-color="fuchsia"></stop>
      <stop offset="100%" stop-color="yellow"></stop>
    </linearGradient>
  `;

  svgDefs += '</defs>';

  return svgDefs;
};
