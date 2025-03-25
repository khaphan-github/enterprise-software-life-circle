export class UserInactivatedError extends Error {
  constructor() {
    super('User inactivated');
  }
}
