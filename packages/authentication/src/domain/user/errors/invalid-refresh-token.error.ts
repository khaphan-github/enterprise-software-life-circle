import { BaseError } from '../../../domain/entity/base-error';

export class InvalidRefreshTokenError extends BaseError {
  constructor(message: string = 'Invalid refresh token') {
    super(message);
  }
}
