import { BaseError } from './base-error.js';

export class BadRequestError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(400, 'Bad Request', originalError, content ?? 'The request could not be understood by the server due to malformed syntax.');
  }
}

export class NotFoundError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(404, 'Not Found', originalError, content ?? 'The requested resource could not be found.');
  }
}

export class StyleError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'Style Error', originalError, content ?? 'An error occurred while applying styles.');
  }
}

export class GeneratorError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'Chart Generator Error', originalError, content ?? 'An error occurred while generating the chart.');
  }
}

export class FetchError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'Fetch Error', originalError, content ?? 'An error occurred while fetching data.');
  }
}

export class ValidationError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(400, 'Validation Error', originalError, content ?? 'The provided data is invalid.');
  }
}

export class SVGGenerationError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'SVG Generation Error', originalError, content ?? 'An error occurred while generating the SVG.');
  }
}
