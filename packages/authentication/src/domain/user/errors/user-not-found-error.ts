import { BaseError } from '../../../domain/entity/base-error';

export class UserNotFoundError extends BaseError {
  constructor() {
    super('User not found');
  }
}
