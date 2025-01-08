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
        #back-link {
          display: flex;
          justify-content: center;
        }
        #back-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">${this.status} - ${this.message}</h1>
      <main>${this.content}</main>
      ${this.content && '<a id="back-link" href="/">Go back</a>'}
    </body>
    </html>`;
  }
}
