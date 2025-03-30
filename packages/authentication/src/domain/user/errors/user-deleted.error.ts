import { BaseError } from '../../../domain/entity/base-error';

export class UserDeletedError extends BaseError {
  constructor() {
    super('User deleted');
  }
}
