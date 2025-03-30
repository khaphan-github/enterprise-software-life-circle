import { BaseError } from '../../../domain/entity/base-error';

export class UserAlreadyExistError extends BaseError {
  constructor() {
    super('User already exist');
  }
}
