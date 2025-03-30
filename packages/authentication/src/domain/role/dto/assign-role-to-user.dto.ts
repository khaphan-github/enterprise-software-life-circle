import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AssignRoleToUserDto {
  @ApiProperty({ description: 'List of roles to assign' })
  @IsArray()
  roleIds: string[];

  @ApiProperty({
    description: 'List of users to assign roles to',
  })
  @IsArray()
  userIds: string[];
}
