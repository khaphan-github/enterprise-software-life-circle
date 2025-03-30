import { BaseError } from '../../../domain/entity/base-error';

export class UserInactivatedError extends BaseError {
  constructor() {
    super('User inactivated');
  }
}
