import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignActionsToRoleDto {
  @ApiProperty({ description: 'List of action IDs to assign', type: [String] })
  @IsArray()
  @IsString({ each: true })
  actionIds: string[];

  @ApiProperty({
    description: 'List of role IDs to assign actions to',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}
