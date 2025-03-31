import { BaseError } from '../../entity/base-error';

export class VerifyMfaCodeNotMatchError extends BaseError {
  constructor() {
    super('The MFA code does not match the expected value');
  }
}
