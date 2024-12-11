import { Error400 } from '../src/error.js';
import { parseParams } from '../src/utils.js';
import { fetchLanguagesByUser } from '../src/services/githubService.js';
import jsonLanguageMappings from '../src/languageMappings.json' assert { type: 'json' }; // TODO: change this since it's experimental (see tsconfig)
import { createBubbleChart } from '../src/chart/generator.js';
import { CONSTANTS } from '../config/consts.js';
import { BubbleChartOptions, BubbleData, TitleOptions } from '../src/chart/types.js';

// TODO: move types in another file

interface LanguageMapping {
  color: string;
  icon: string;
}
type LanguageMappings = Record<string, LanguageMapping>;

const defaultHeaders = new Headers({
  'Content-Type': 'image/svg+xml',
  'Cache-Control': `public, max-age=${CONSTANTS.CACHE_MAX_AGE}`,
});

export default async (req: any, res: any) => {
  const params = parseParams(req);
  const username = params.get('username');

  if (!username) {
    handleMissingUsername(req, res);
    return;
  }

  try {
    const languagePercentages = await fetchLanguagesByUser(username!);
    const languageMappings: LanguageMappings = jsonLanguageMappings;
    var bubbleData: BubbleData[] = languagePercentages.map((l) => ({
      name: l.language,
      value: Number(l.percentage),
      color: languageMappings[l.language]?.color || '',
      icon: languageMappings[l.language]?.icon || '',
    }));

    var options: BubbleChartOptions = {
      titleOptions: params.parseTitleOptions(),
      showPercentages: params.get('showPercentages') === 'true',
      legendOptions: params.parseLegendOptions(),
    };

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

async function handleMissingUsername(req: any, res: any) {
  const [base] = req.url.split('?');
  const error = new Error400(
    `<section>
      <div>
        <h2>"username" is a required query parameter</h2>
        <p>The URL should look like</p>
        <div>
          <p id="base-show">${base}?username=USERNAME</p>
          <button>Copy Base Url</button>
          <span id="temporary-span"></span>
        </div>where
        <code>USERNAME</code> is <em>your GitHub username.</em>
      </div>
      <div>
        <h2>You can use this form: </h2>
        <p>Enter your username and click get chart</p>
        <form action="https://github-bubble-chart.vercel.app/" method="get">
          <label for="username">GitHub Username</label>
          <input type="text" name="username" id="username" placeholder="Ex. teociaps" required>
          <text>
            See all the available options
            <a href="https://github.com/teociaps/github-bubble-chart?tab=readme-ov-file" target="_blank">here</a>
          </text>
          <br>
          <button type="submit">Get Chart</button>
        </form>
      </div>
      <script>
        const base = "https://github-bubble-chart.vercel.app/";
        const button = document.querySelector("button");
        const temporarySpan = document.querySelector("#temporary-span");

        button.addEventListener("click", () => {
          navigator.clipboard.writeText(document.querySelector("#base-show").textContent);
          temporarySpan.textContent = "Copied!";
          setTimeout(() => {
            temporarySpan.textContent = "";
          }, 1500);
        });
      </script>
    </section>`,
  );
  console.error(error);
  res.send(error.render());
}
