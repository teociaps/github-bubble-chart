import { Error400 } from '../src/error.js';
import { CONSTANTS, parseParams } from '../src/utils.js';
import { fetchLanguagesByUser } from '../src/services/githubService.js';
import * as d3 from 'd3';
import languageMappings from '../src/languageMappings.json' assert { type: 'json' }; // TODO: change this since it's experimental (see tsconfig)

// TODO: arrange better

const defaultHeaders = new Headers({
  'Content-Type': 'image/svg+xml',
  'Cache-Control': `public, max-age=${CONSTANTS.CACHE_MAX_AGE}`,
});


export default async (req: any, res: any) => {
  const params = parseParams(req);
  const username = params.get('username');

  console.log(languageMappings["JavaScript"]); // TEST: to remove

  if (!username) {
    const [base] = req.url.split('?');
    const error = new Error400(
      `<section>
        <div>
          <h2>"username" is a required query parameter</h2>
          <p>The URL should look like
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
            <label for="theme">Theme (Optional)</label>
            <input type="text" name="theme" id="theme" placeholder="Ex. onedark" value="light">
            <text>
              See all the available themes
              <a href="https://github.com/teociaps/github-bubble-chart?tab=readme-ov-file" target="_blank">here</a>
            </text>
            <br>
            <button type="submit">Get Chart</button>
          </form>
        </div>
        <script>
          const base = "https://github-bubble-chart.vercel.app/";
          const button = document.querySelector("button");
          const input = document.querySelector("input");
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
    return res.send(error.render());
    // return new Response(error.render(), {
    //   status: error.status,
    //   headers: new Headers({ 'Content-Type': 'text' }),
    // });
  }

  try {
    // TODO: create a service to build the svg
    // Fetch language data
    const languagePercentages = await fetchLanguagesByUser(username);
    // SVG dimensions
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Create the pie layout
    const pie = d3
      .pie<{ language: string; percentage: string }>()
      .value((d) => parseFloat(d.percentage));
    const dataReady = pie(languagePercentages);

    // Create the arc generator
    const arc = d3
      .arc<d3.PieArcDatum<{ language: string; percentage: string }>>()
      .innerRadius(0) // Full pie chart (no hole)
      .outerRadius(radius);

    // Generate colors
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Generate SVG paths for each slice
    const slices = dataReady
      .map((d, i) => {
        const path = arc(d)!;
        const fillColor = color(i.toString());
        return `<path d="${path}" fill="${fillColor}" />`;
      })
      .join('');

    // Generate the legend
    const legend = languagePercentages
      .map((item, index) => {
        const legendX = width - 120;
        const legendY = 20 + index * 20;

        return `
        <rect x="${legendX}" y="${legendY}" width="15" height="15" fill="${color(
          index.toString(),
        )}" />
        <text x="${legendX + 20}" y="${legendY + 12}" font-size="12" font-family="Arial">${
          item.language
        } (${item.percentage}%)</text>
      `;
      })
      .join('');

    // Generate the SVG string
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <g transform="translate(${radius}, ${radius})">
          ${slices}
        </g>
        ${legend}
        <text x="${width / 2}" y="${
      height - 20
    }" text-anchor="middle" font-family="Arial" font-size="14" fill="#333">
          ${username}'s Language Usage
        </text>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg.trim());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch languages for specified user" });
  }
  
  // Success Response
  // return new Response('', {
  //   headers: defaultHeaders,
  // });
}
