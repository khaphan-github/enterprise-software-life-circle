import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'strongPassword123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Metadata of the user',
    required: false,
    example: { age: 30, country: 'USA' },
  })
  @IsOptional()
  metadata?: object;
}

export class CreateUseruccessDTO {
  id: string;
  username: string;
  status: string;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}
