import { CONSTANTS } from '../config/consts.js';
import { ThemeBase, themeMap } from './chart/themes.js';
import { TextAlign, LegendOptions, TitleOptions, TextAnchor, ConfigOptions, BubbleChartOptions, BubbleData, CustomConfig } from './chart/types.js';
import { Error400 } from './common/error.js';
import { isDevEnvironment } from './common/utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  let protocol = req.protocol;
  if (!isDevEnvironment() && protocol === 'http') {
    protocol = 'https';
  }
  const url = new URL(req.url, `${protocol}://${req.get('host')}`);
  const base = `${url.origin}${req.baseUrl}`;
  const error = new Error400(
    `${getMissingUsernameCSS()}
    <section>
      <div class="container">
        <h2 class="error-title">Missing Required Parameter</h2>
        <p>The URL should include the <code>username</code> query parameter:</p>
        <div class="url-container">
          <p id="base-show">${base}?username=USERNAME</p>
          <button class="copy-button">Copy URL</button>
          <span id="temporary-span" class="copy-status"></span>
        </div>
        <p>Replace <code>USERNAME</code> with your GitHub username.</p>
      </div>
      <div class="form-container">
        <h2 class="form-title">Quick Form</h2>
        <p>Enter your GitHub username and click the button to generate the chart:</p>
        <form action="${base}" method="get">
          <label for="username">GitHub Username</label>
          <input type="text" name="username" id="username" placeholder="Ex. teociaps" required>
          <p>
            For more options, visit
            <a href="https://github.com/teociaps/github-bubble-chart?tab=readme-ov-file" target="_blank">this page</a>.
          </p>
          <button type="submit">Generate Chart</button>
        </form>
      </div>
      <script>
        const button = document.querySelector(".copy-button");
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

export async function fetchConfigFromRepo(username: string, filePath: string, branch?: string): Promise<{ options: BubbleChartOptions, data: BubbleData[] }> {
  if (isDevEnvironment()) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const localPath = path.resolve(__dirname, '../../', 'example-config.json');
    if (fs.existsSync(localPath)) {

      const customConfig = JSON.parse(fs.readFileSync(localPath, 'utf-8')) as CustomConfig;
      const options = mapConfigToBubbleChartOptions(customConfig.options)

      return { options: options, data: customConfig.data };
    } else {
      throw new Error(`Local config file not found at ${localPath}`);
    }
  } else {
    const url = `https://raw.githubusercontent.com/${username}/${username}/${branch || 'main'}/${filePath}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${CONSTANTS.GITHUB_TOKEN}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch config from ${filePath} in ${username} repository`);
    }

    const customConfig = await response.json() as CustomConfig;
    const options = mapConfigToBubbleChartOptions(customConfig.options)

    return { options: options, data: customConfig.data };
  }
}

function mapConfigToBubbleChartOptions(config: ConfigOptions): BubbleChartOptions {
  const theme = typeof config.theme === 'string' ? themeMap[config.theme.toLowerCase()] : config.theme;
  return {
    width: config.width,
    height: config.height,
    showPercentages: config.showPercentages,
    titleOptions: {
      text: config.title.text,
      fontSize: config.title.fontSize,
      fontWeight: config.title.fontWeight,
      fill: config.title.color,
      textAnchor: config.title.align,
    },
    legendOptions: {
      show: config.legend.show,
      align: config.legend.align,
    },
    theme: theme,
  };
}

function getMissingUsernameCSS(): string {
  return `
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
      }
      .container {
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      .error-title {
        color: #d9534f;
      }
      .url-container {
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 5px;
      }
      #base-show {
        font-family: monospace;
      }
      .copy-button {
        background-color: #5bc0de;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
      }
      .copy-status {
        margin-left: 10px;
        color: #5cb85c;
      }
      .form-container {
        margin-top: 20px;
      }
      .form-title {
        color: #5bc0de;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      label {
        margin-bottom: 5px;
      }
      input[type="text"] {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 100%;
        max-width: 300px;
      }
      a {
        color: #5bc0de;
      }
      button[type="submit"] {
        background-color: #5cb85c;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
      }
    </style>
  `;
}
