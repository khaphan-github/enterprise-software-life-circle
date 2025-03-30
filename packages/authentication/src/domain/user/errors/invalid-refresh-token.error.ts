import { BaseError } from '../../../domain/entity/base-error';

export class InvalidRefreshTOkenError extends BaseError {
  constructor() {
    super('Invalid refresh token');
  }
}
