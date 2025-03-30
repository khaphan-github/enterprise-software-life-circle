import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateEndpointCommand } from '../command/create-endpoints.command';
import { EndpointStatus } from '../endpoint-entity';

export class CreateEndpointDTO implements ICreateEndpointCommand {
  @ApiProperty({ description: 'The path of the endpoint' })
  @IsString()
  path: string;

  @ApiProperty({ description: 'The HTTP method of the endpoint' })
  @IsString()
  method: string;

  @ApiPropertyOptional({ description: 'Optional metadata for the endpoint' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'The status of the endpoint',
    enum: EndpointStatus,
  })
  @IsString()
  status: EndpointStatus;
}
