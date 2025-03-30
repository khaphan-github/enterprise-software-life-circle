import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteEndpointDTO {
  @ApiProperty({
    description: 'The IDs of the endpoints to delete',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
