import { CONSTANTS } from '../config/consts.js';
import { defaultHeaders, handleMissingUsername, parseParams } from '../src/api-utils.js';
import { createBubbleChart } from '../src/chart/generator.js';
import { BubbleChartOptions } from '../src/chart/types.js';
import { getBubbleData } from '../src/chart/utils.js';

export default async (req: any, res: any) => {
  const params = parseParams(req);
  const username = params.get('username');

  if (!username) {
    handleMissingUsername(req, res);
    return;
  }

  try {
    const options: BubbleChartOptions = {
      width: params.getNumberValue('width', 600),
      height: params.getNumberValue('height', 400),
      titleOptions: params.parseTitleOptions(),
      showPercentages: params.getBooleanValue('percentages', false),
      legendOptions: params.parseLegendOptions(),
      theme: params.getTheme('theme', CONSTANTS.DEFAULT_THEME),
    };

    const langsCount = params.getLanguagesCount(10) // Default: 10

    const bubbleData = await getBubbleData(username, langsCount);
    const svg = createBubbleChart(bubbleData, options);

    if (!svg) {
      console.error('svg not generated.');
      return res.send('svg not generated.');
    }

    res.setHeaders(defaultHeaders);
    res.send(svg.trim());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch languages for specified user' });
  }
};
