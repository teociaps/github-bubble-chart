abstract class BaseError {
  readonly status!: number;
  readonly message!: string;
  constructor(readonly content?: string) {}
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
      <main>${this.content ?? ''}</main>
      ${this.content && '<a id="back-link" href="/">Go back</a>'}
    </body>
    </html>`;
  }
}

export class Error400 extends BaseError {
  readonly status = 400;
  readonly message = 'Bad Request';
}

export class Error419 extends BaseError {
  readonly status = 419;
  readonly message = 'Rate Limit Exceeded';
}

export class Error404 extends BaseError {
  readonly status = 404;
  readonly message = 'Not Found';
}

// TODO: enhance error management