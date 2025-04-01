import { ResetPassword } from '../user-entity';

export class PasswordResetRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly resetPassword: ResetPassword,
  ) {}
}
