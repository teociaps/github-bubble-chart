/**
 * Checks if the current environment is development
 * @returns true if NODE_ENV is 'dev'
 */
export const isDevEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'dev';
};

/**
 * Checks if the current environment is production
 * @returns true if NODE_ENV is 'prod'
 */
export const isProdEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'prod';
};
