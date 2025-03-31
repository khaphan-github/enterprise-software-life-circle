import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// Define the DTO for Google Login
export class GoogleLoginDTO {
  @ApiProperty({ description: 'Google OAuth token' })
  @IsString()
  token: string;
}
