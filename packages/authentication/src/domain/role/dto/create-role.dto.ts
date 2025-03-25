import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'The name of the role' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: 'The description of the role' })
  @IsString()
  readonly description: string;

  @ApiProperty({ description: 'The status of the role' })
  @IsString()
  @IsNotEmpty()
  readonly status: string;

  @ApiProperty({
    description: 'Additional metadata for the role',
    type: Object,
  })
  @IsObject()
  readonly metadata: object;
}
