import { BaseError } from '../../../domain/entity/base-error';

export class UserEmailAlreadyExistError extends BaseError {
  constructor() {
    super('UserEmail already exist');
  }
}
