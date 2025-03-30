import { IsString } from 'class-validator';
import { CreateEndpointDTO } from './create-endpoint.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEndpointDTO extends CreateEndpointDTO {
  @ApiProperty({ description: 'The ID of the endpoint to update' })
  @IsString()
  id: string;
}
