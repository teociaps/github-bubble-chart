import { CONSTANTS } from '../config/consts.js';
import { ThemeBase, themeMap } from './chart/themes.js';
import { TextAlign, LegendOptions, TitleOptions, TextAnchor, ConfigOptions, BubbleChartOptions, BubbleData, CustomConfig } from './chart/types.js';
import { BadRequestError } from './errors/base-error.js'; // Update import paths
import { GitHubNotFoundError, GitHubRateLimitError } from './errors/github-errors.js'; // Update import paths
import { ValidationError, FetchError } from './errors/custom-errors.js'; // Update import paths
import { isDevEnvironment } from './common/utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class CustomURLSearchParams extends URLSearchParams {
  getStringValue(key: string, defaultValue: string): string {
    try {
      if (super.has(key)) {
        const param = super.get(key);
        if (param !== null) {
          return param.toString();
        }
      }
      return defaultValue.toString();
    } catch (error) {
      throw new ValidationError('Invalid string parameter', error instanceof Error ? error : undefined);
    }
  }

  getNumberValue(key: string, defaultValue: number): number {
    try {
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
    } catch (error) {
      throw new ValidationError('Invalid number parameter', error instanceof Error ? error : undefined);
    }
  }

  getBooleanValue(key: string, defaultValue: boolean): boolean {
    try {
      if (super.has(key)) {
        const param = super.get(key);
        return param !== null && param.toString() === 'true';
      }
      return defaultValue;
    } catch (error) {
      throw new ValidationError('Invalid boolean parameter', error instanceof Error ? error : undefined);
    }
  }

  getTheme(key: string, defaultValue: ThemeBase): ThemeBase {
    try {
      if (super.has(key)) {
        const param = super.get(key);
        if (param !== null) {
          return themeMap[param.toLowerCase()] || defaultValue;
        }
      }
      return defaultValue;
    } catch (error) {
      throw new ValidationError('Invalid theme parameter', error instanceof Error ? error : undefined);
    }
  }

  getTextAnchorValue(key: string, defaultValue: TextAnchor): TextAnchor {
    try {
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
    } catch (error) {
      throw new ValidationError('Invalid text anchor parameter', error instanceof Error ? error : undefined);
    }
  }

  getLanguagesCount(defaultValue: number) {
    try {
      const value = this.getNumberValue('langs-count', defaultValue);
      if (value < 1) return 1;
      if (value > 20) return 20;
      return value;
    } catch (error) {
      throw new ValidationError('Invalid languages count parameter', error instanceof Error ? error : undefined);
    }
  }

  parseTitleOptions(): TitleOptions {
    try {
      return {
        text: this.getStringValue('title', 'Bubble Chart'),
        fontSize: this.getNumberValue('title-size', 24) + 'px',
        fontWeight: this.getStringValue('title-weight', 'bold'),
        fill: this.getStringValue('title-color', this.getTheme('theme', CONSTANTS.DEFAULT_THEME).textColor),
        textAnchor: this.getTextAnchorValue('title-align', 'middle')
      };
    } catch (error) {
      throw new ValidationError('Invalid title options', error instanceof Error ? error : undefined);
    }
  }

  parseLegendOptions(): LegendOptions {
    try {
      return {
        show: this.getBooleanValue('legend', false),
        align: this.getStringValue('legend-align', 'left') as TextAlign,
      };
    } catch (error) {
      throw new ValidationError('Invalid legend options', error instanceof Error ? error : undefined);
    }
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
  const error = new BadRequestError(
    `${getMissingUsernameCSS()}
    <section>
      <div class="container">
        <h2 class="error-title">Missing Required Parameter</h2>
        <p>The URL should include the <code>username</code> query parameter:</p>
        <div class="url-container">
          <p id="baseurl-show">${base}?username=USERNAME</p>
          <button type="button" class="copy-button">Copy URL</button>
          <span id="temporary-span" class="copy-status"></span>
        </div>
        <p>Replace <code>USERNAME</code> with your GitHub username.</p>
      </div>
      <div class="container form-container">
        <h2 class="form-title">Quick Form</h2>
        <p>Enter your GitHub username and click the button to generate the chart.</p>
        <form action="${base}" method="get">
          <label for="username">GitHub Username:</label>
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
          navigator.clipboard.writeText(document.querySelector("#baseurl-show").textContent);
          temporarySpan.textContent = "Copied!";
          setTimeout(() => {
            temporarySpan.textContent = "";
          }, 1500);
        });
      </script>
    </section>`,
  );
  res.send(error.render());
}

export async function fetchConfigFromRepo(username: string, filePath: string, branch?: string): Promise<{ options: BubbleChartOptions, data: BubbleData[] }> {
  try {
    if (isDevEnvironment()) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const localPath = path.resolve(__dirname, '../../', 'example-config.json');
      if (fs.existsSync(localPath)) {
        const customConfig = JSON.parse(fs.readFileSync(localPath, 'utf-8')) as CustomConfig;
        const options = mapConfigToBubbleChartOptions(customConfig.options);
        return { options: options, data: customConfig.data };
      } else {
        throw new FetchError(`Local config file not found at ${localPath}`);
      }
    } else {
      const url = `https://raw.githubusercontent.com/${username}/${username}/${branch || 'main'}/${filePath}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${CONSTANTS.GITHUB_TOKEN}`
        }
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new GitHubNotFoundError(`The repository or file at ${filePath} was not found.`);
        } else if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
          throw new GitHubRateLimitError('You have exceeded the GitHub API rate limit.');
        } else {
          throw new FetchError(`Failed to fetch config from ${filePath} in ${username} repository`, new Error(`HTTP status ${response.status}`));
        }
      }

      const customConfig = await response.json() as CustomConfig;
      const options = mapConfigToBubbleChartOptions(customConfig.options);
      return { options: options, data: customConfig.data };
    }
  } catch (error) {
    throw new FetchError('Failed to fetch configuration from repository', error instanceof Error ? error : undefined);
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
      section {
        width: 80%;
        margin: 0 auto;
        padding: 20px;
      }
      
      button {
        padding: 10px 20px;
        color: #fff;
        border: none;
        border-radius: inherit;
        cursor: pointer;
      }
      
      .container {
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      }
      
      .url-container {
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ededed; 
      }
      #baseurl-show {
        font-family: monospace;
        color: #333;
        background-color: #f4f4f4;
        padding: 10px;
        border-radius: inherit;
        margin: 10px 0;
      }
      .copy-button {
        background-color: #5bc0de;
        &:hover {
          background-color: #3da7c7;
        }
      }
      .copy-status {
        margin-left: 10px;
        color: #5cb85c;
      }

      .form-container {
        margin-top: 20px;
      }
      .form-title {
        color: #6530bb;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-radius: inherit;
      }
      label {
        margin-bottom: 2px;
      }
      input {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: inherit;
        max-width: 300px;
      }
      button[type="submit"] {
        background-color: #5cb85c;
        &:hover {
          background-color: #378a37;
        }
      }

      @media (max-width: 768px) {
        #baseurl-show {
          font-size: 14px;
        }
      }
      @media (max-width: 480px) {
        #baseurl-show {
          font-size: 10px;
        }
      }
      @media (min-width: 768px) {
        section {
          width: 60%;
        }
      }
      @media (min-width: 1024px) {
        section {
          width: 50%;
        }
      }
    </style>
  `;
}
