export class BaseError extends Error {
  constructor(
    readonly status: number,
    readonly message: string,
    public originalError?: Error,
    public content: string = 'An unexpected error occurred. Please try again later.'
  ) {
    super(message);
    this.name = this.constructor.name;
    if (originalError) {
      this.stack = originalError.stack;
    }
  }

  render() {
    return this.renderPage();
  }

  private renderPage() {
    return `<!DOCTYPE html>
    <html lang="en"><head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GitHub Bubble Chart</title>
      <meta name="description" content="🫧 Add dynamically generated Bubble Chart with your most used languages on your readme">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #f7f7f7;
        }
        a {
          text-decoration: none;
          color: #398dff;
        }
        .error-title {
          color: #d9534f;
        }
        #link-container {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
          align-items: center;
          margin: 1rem auto;
          text-align: center;
          width: 60%;
        }
        #link-container a {
          margin: 0.5rem 0;
        }
        #link-container a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">${this.status} - ${this.message}</h1>
      <main>${this.content}</main>
      <div id="link-container">
        ${this.content && '<a id="back-link" href="/">Go back</a>'}
        <a id="contact-link" href="https://github.com/teociaps/github-bubble-chart/discussions" target="_blank">Contact us</a>
        <a id="bug-link" href="https://github.com/teociaps/github-bubble-chart/issues/new?assignees=&labels=needs%3A+triage%2Cbug&projects=&template=bug_report.yml&title=%5BBug%5D%3A+" target="_blank">Report a bug</a>
      </div>
    </body>
    </html>`;
  }
}
