import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDTO {
  @ApiProperty({
    description: 'The refresh token used to obtain a new access token',
    example: 'your-refresh-token',
  })
  @IsString()
  refreshToken: string;
}
