import { BaseError } from '../../../domain/entity/base-error';

export class PasswordNotMatchError extends BaseError {
  constructor() {
    super('Password not match');
  }
}
