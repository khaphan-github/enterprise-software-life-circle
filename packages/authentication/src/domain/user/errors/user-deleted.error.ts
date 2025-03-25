export class UserDeletedError extends Error {
  constructor() {
    super('User deleted');
  }
}
