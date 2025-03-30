import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignEndpointsToRoleDto {
  @ApiProperty({
    description: 'List of endpoint IDs to assign',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  endpointIds: string[];

  @ApiProperty({
    description: 'List of role IDs to assign endpoints to',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}
