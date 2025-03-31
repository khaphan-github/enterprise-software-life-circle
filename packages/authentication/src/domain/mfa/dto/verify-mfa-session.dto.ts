import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyMfaSessionDTO {
  @ApiProperty({
    example: 'session12345',
    description: 'The ID of the MFA session',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    example: '123456',
    description: 'The one-time password (OTP) for verification',
  })
  @IsString()
  otp: string;
}
