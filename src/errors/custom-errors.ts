import { BaseError } from './base-error.js';

export class BadRequestError extends BaseError {
  constructor(
    content?: string,
    public originalError?: Error,
  ) {
    super(
      400,
      'Bad Request',
      originalError,
      content ??
        'The request could not be understood by the server due to malformed syntax.',
    );
  }
}

export class NotFoundError extends BaseError {
  constructor(
    content?: string,
    public originalError?: Error,
  ) {
    super(
      404,
      'Not Found',
      originalError,
      content ?? 'The requested resource could not be found.',
    );
  }
}

export class StyleError extends BaseError {
  constructor(
    content?: string,
    public originalError?: Error,
  ) {
    super(
      500,
      'Style Error',
      originalError,
      content ?? 'An error occurred while applying styles.',
    );
  }
}

export class GeneratorError extends BaseError {
  constructor(
    content?: string,
    public originalError?: Error,
  ) {
    super(
      500,
      'Chart Generator Error',
      originalError,
      content ?? 'An error occurred while generating the chart.',
    );
  }
}

export class FetchError extends BaseError {
  constructor(
    content?: string,
    public originalError?: Error,
  ) {
    super(
      500,
      'Fetch Error',
      originalError,
      content ?? 'An error occurred while fetching data.',
    );
  }
}

export class ValidationError extends BaseError {
  constructor(
    content?: string,
    public originalError?: Error,
  ) {
    super(
      400,
      'Validation Error',
      originalError,
      content ?? 'The provided data is invalid.',
    );
  }
}

export class SVGGenerationError extends BaseError {
  constructor(
    content?: string,
    public originalError?: Error,
  ) {
    super(
      500,
      'SVG Generation Error',
      originalError,
      content ?? 'An error occurred while generating the SVG.',
    );
  }
}

export class MissingUsernameError extends BaseError {
  constructor(baseURL: string) {
    super(400, 'Bad Request', undefined, MissingUsernameError.getHTML(baseURL));
  }

  private static getHTML(baseURL: string): string {
    return `
      ${MissingUsernameError.getCSS()}
      <section>
        <div class="container">
          <h2 class="error-title">Missing Required Parameter</h2>
          <p>The URL should include the <code>username</code> query parameter:</p>
          <div class="url-container">
            <p id="baseurl-show">${baseURL}?username=USERNAME</p>
            <button type="button" class="copy-button">Copy URL</button>
            <span id="temporary-span" class="copy-status"></span>
          </div>
          <p>Replace <code>USERNAME</code> with your GitHub username.</p>
        </div>
        <div class="container form-container">
          <h2 class="form-title">Quick Form</h2>
          <p>Enter your GitHub username and click the button to generate the chart.</p>
          <form action="${baseURL}" method="get">
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
      </section>
    `;
  }

  private static getCSS(): string {
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
}
