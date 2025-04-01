import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResetPasswordMethod } from '../user-entity';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Method to reset the password',
    enum: ResetPasswordMethod,
    example: ResetPasswordMethod.EMAIL,
  })
  @IsNotEmpty()
  method: ResetPasswordMethod;
}
