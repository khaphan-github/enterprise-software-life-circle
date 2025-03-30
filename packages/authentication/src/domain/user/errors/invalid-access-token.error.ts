import { BaseError } from '../../../domain/entity/base-error';

export class InvalidAccessTokenError extends BaseError {
  constructor() {
    super('Invalid access token');
  }
}
