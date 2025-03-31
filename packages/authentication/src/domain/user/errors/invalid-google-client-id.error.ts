import { BaseError } from '../../../domain/entity/base-error';

export class InvalidGoogleClientIdError extends BaseError {
  constructor() {
    super('Invalid Google Client ID');
  }
}
