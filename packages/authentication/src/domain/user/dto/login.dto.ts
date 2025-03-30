import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'strongPassword123',
  })
  @IsString()
  password: string;
}

export class UserLoginSuccessDTO {
  id: string;
  username: string;
  status: string;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}
