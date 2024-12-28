export const isDevEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'dev';
};

export const isProdEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'prod';
};