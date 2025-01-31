import { Request, Response } from 'express';
import {
  defaultHeaders,
  fetchConfigFromRepo,
  handleMissingUsername,
  parseParams,
  handleErrorResponse,
} from './utils.js';
import { CONSTANTS } from '../config/consts.js';
import { createBubbleChart } from '../src/chart/generator.js';
import { BubbleChartOptions } from '../src/chart/types/chartOptions.js';
import { getBubbleData } from '../src/chart/utils.js';
import { SVGGenerationError } from '../src/errors/custom-errors.js';

export default async (req: Request, res: Response): Promise<void> => {
  const params = parseParams(req);
  const username = params.get('username');
  const configBranch = params.get('config-branch') || undefined;
  const configPath = params.get('config-path');
  const mode = params.getMode();

  if (!username) {
    handleMissingUsername(req, res);
    return;
  }

  try {
    let options: BubbleChartOptions;
    let bubbleData;

    if (mode === 'custom-config' && configPath) {
      const config = await fetchConfigFromRepo(
        username,
        configPath,
        configBranch,
      );
      options = config.options;
      bubbleData = config.data;
    } else {
      options = {
        width: params.getNumberValue('width', 600),
        height: params.getNumberValue('height', 400),
        titleOptions: params.parseTitleOptions(),
        showPercentages: params.getPercentageDisplayOption('percentages'),
        legendOptions: params.parseLegendOptions(),
        theme: params.getTheme('theme', CONSTANTS.DEFAULT_THEME),
      };

      const langsCount = params.getLanguagesCount(10);
      bubbleData = await getBubbleData(username, langsCount);
    }

    const svg = await createBubbleChart(bubbleData, options);

    if (!svg) {
      throw new SVGGenerationError(
        'SVG generation failed: No data available or invalid configuration.',
      );
    }

    res.setHeaders(defaultHeaders);
    res.send(svg.trim());
  } catch (error) {
    handleErrorResponse(error instanceof Error ? error : undefined, res);
  }
};
