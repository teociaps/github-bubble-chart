import { BaseError } from './base-error.js';

export class GitHubError extends BaseError {
  constructor(readonly status: number, readonly message: string, content?: string) {
    super(status, message, undefined, content);
  }
}

export class GitHubNotFoundError extends GitHubError {
  constructor(content?: string) {
    super(404, 'GitHub Repository Not Found', content);
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(content?: string) {
    super(403, 'GitHub API Rate Limit Exceeded', content);
  }
}

export class GitHubBadCredentialsError extends GitHubError {
  constructor(content?: string) {
    super(401, 'GitHub Bad Credentials', content);
  }
}

export class GitHubAccountSuspendedError extends GitHubError {
  constructor(content?: string) {
    super(403, 'GitHub Account Suspended', content);
  }
}
