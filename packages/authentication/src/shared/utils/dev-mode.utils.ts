export function isDevMode(): boolean {
  return process.env.NODE_ENV != 'prod';
}

export function isTestMode(): boolean {
  return process.env.NODE_ENV == 'test';
}
