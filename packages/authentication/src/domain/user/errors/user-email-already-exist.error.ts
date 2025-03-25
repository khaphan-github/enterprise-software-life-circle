export class UserEmailAlreadyExistError extends Error {
  constructor() {
    super('UserEmail already exist');
  }
}
