import { BaseError } from './base-error.js';

export class GitHubError extends BaseError {
  constructor(readonly status: number, readonly message: string, content?: string) {
    super(status, message, undefined, content);
  }
}

export class GitHubNotFoundError extends GitHubError {
  constructor(content?: string) {
    super(404, 'The requested GitHub repository could not be found.', content);
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(content?: string) {
    super(403, 'You have exceeded the GitHub API rate limit.', content);
  }
}

export class GitHubBadCredentialsError extends GitHubError {
  constructor(content?: string) {
    super(401, 'The provided GitHub credentials are invalid.', content);
  }
}

export class GitHubAccountSuspendedError extends GitHubError {
  constructor(content?: string) {
    super(403, 'The GitHub account has been suspended.', content);
  }
}
