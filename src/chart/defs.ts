
export const createSVGDefs = (svg: d3.Selection<SVGSVGElement, undefined, null, undefined>) => {
  const createRadialGradient = (id: string, coordinates: { fx: string, fy: string }, stops: { offset: string, color: string, opacity?: number }[]) => {
    const gradient = svgDefs.append('radialGradient')
      .attr('id', id)
      .attr('fx', coordinates.fx)
      .attr('fy', coordinates.fy);
    stops.forEach(stop => {
      const stopElement = gradient.append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color);
      if (stop.opacity !== undefined) stopElement.attr('stop-opacity', stop.opacity);
    });
  };

  const svgDefs = svg.append('defs');

  createRadialGradient('grad--bw', { fx: '25%', fy: '25%' }, [
    { offset: '0%', color: 'black' },
    { offset: '30%', color: 'black', opacity: 0.2 },
    { offset: '97%', color: 'white', opacity: 0.4 },
    { offset: '100%', color: 'black' }
  ]);

  createRadialGradient('grad--spot', { fx: '50%', fy: '20%' }, [
    { offset: '10%', color: 'white', opacity: 0.7 },
    { offset: '70%', color: 'white', opacity: 0 }
  ]);

  createRadialGradient('grad--bw-light', { fx: '25%', fy: '10%' }, [
    { offset: '60%', color: 'black', opacity: 0 },
    { offset: '90%', color: 'white', opacity: 0.25 },
    { offset: '100%', color: 'black' }
  ]);

  const createMask = (id: string, gradientId: string, transform?: string) => {
    const mask = svgDefs.append('mask')
      .attr('id', id)
      .attr('maskContentUnits', 'objectBoundingBox');
    mask.append('rect')
      .attr('fill', `url(#${gradientId})`)
      .attr('width', 1)
      .attr('height', 1)
      .attr('transform', transform || '');
  };

  createMask('mask', 'grad--bw');
  createMask('mask--light-top', 'grad--bw-light', 'rotate(180, .5, .5)');
  createMask('mask--light-bottom', 'grad--bw-light');

  const colorLinearGradient = svgDefs.append('linearGradient')
    .attr('id', 'grad')
    .attr('x1', 0)
    .attr('y1', '100%')
    .attr('x2', '100%')
    .attr('y2', 0);
  
  colorLinearGradient.append('stop').attr('offset', '0').attr('stop-color', 'dodgerblue');
  colorLinearGradient.append('stop').attr('offset', '50%').attr('stop-color', 'fuchsia');
  colorLinearGradient.append('stop').attr('offset', '100%').attr('stop-color', 'yellow');
};