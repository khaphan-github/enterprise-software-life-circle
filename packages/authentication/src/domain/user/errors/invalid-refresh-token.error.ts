export class InvalidRefreshTOkenError extends Error {
  constructor() {
    super('Invalid refresh token');
  }
}
