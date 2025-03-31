import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyLoginMfaSessionDTO {
  @ApiProperty({
    example: 'session67890',
    description: 'The ID of the login MFA session',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    example: '654321',
    description: 'The one-time password (OTP) for login verification',
  })
  @IsString()
  otp: string;
}
