import { CONSTANTS } from '../config/consts.js';
import { ThemeBase, themeMap } from './chart/themes.js';
import { TextAlign, LegendOptions, TitleOptions, TextAnchor } from './chart/types.js';
import { Error400 } from './error.js';

export class CustomURLSearchParams extends URLSearchParams {
  getStringValue(key: string, defaultValue: string): string {
    if (super.has(key)) {
      const param = super.get(key);
      if (param !== null) {
        return param.toString();
      }
    }
    return defaultValue.toString();
  }

  getNumberValue(key: string, defaultValue: number): number {
    if (super.has(key)) {
      const param = super.get(key);
      if (param !== null) {
        const parsedValue = parseInt(param);
        if (isNaN(parsedValue)) {
          return defaultValue;
        }
        return parsedValue;
      }
    }
    return defaultValue;
  }

  getBooleanValue(key: string, defaultValue: boolean): boolean {
    if (super.has(key)) {
      const param = super.get(key);
      return param !== null && param.toString() === 'true';
    }
    return defaultValue;
  }

  getTheme(key: string, defaultValue: ThemeBase): ThemeBase {
    if (super.has(key)) {
      const param = super.get(key);
      if (param !== null) {
        return themeMap[param.toLowerCase()] || defaultValue; // Fallback to default theme
      }
    }
    return defaultValue;
  }

  getTextAnchorValue(key: string, defaultValue: TextAnchor): TextAnchor {
    const value = this.getStringValue(key, defaultValue);
    switch (value) {
      case 'left':
        return 'start';
      case 'center':
        return 'middle';
      case 'right':
        return 'end';
      default:
        return defaultValue;
    }
  }

  getLanguagesCount(defaultValue: number) {
    const value = this.getNumberValue('langs-count', defaultValue);
    if (value < 1) return 1;
    if (value > 20) return 20;
    return value;
  }

  parseTitleOptions(): TitleOptions {
    return {
      text: this.getStringValue('title', 'Bubble Chart'),
      fontSize: this.getNumberValue('title-size', 24) + 'px',
      fontWeight: this.getStringValue('title-weight', 'bold'),
      fill: this.getStringValue('title-color', this.getTheme('theme', CONSTANTS.DEFAULT_THEME).textColor),
      textAnchor: this.getTextAnchorValue('title-align', 'middle')
    };
  }

  parseLegendOptions(): LegendOptions {
    return {
      show: this.getBooleanValue('legend', false),
      align: this.getStringValue('legend-align', 'left') as TextAlign,
    };
  }
}

export function parseParams(req: Request): CustomURLSearchParams {
  const splittedURL = req.url.split('?');
  if (splittedURL.length < 2) {
    return new CustomURLSearchParams();
  }
  return new CustomURLSearchParams(splittedURL[1]);
}

export const defaultHeaders = new Headers({
  'Content-Type': 'image/svg+xml',
  'Cache-Control': `public, max-age=${CONSTANTS.CACHE_MAX_AGE}`,
});

export async function handleMissingUsername(req: any, res: any) {
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
