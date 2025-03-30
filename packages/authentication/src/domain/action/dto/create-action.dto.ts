import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional } from 'class-validator';
import { ICreateActionsCommand } from '../commands/create-actions.command';
import { ActionStatus } from '../action-entity';

export class CreateActionDTO implements ICreateActionsCommand {
  @ApiProperty({ description: 'The name of the action' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the action' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'The status of the action', enum: ActionStatus })
  @IsString()
  status: ActionStatus;

  @ApiProperty({
    description: 'Additional metadata for the action',
    type: Object,
  })
  @IsObject()
  @IsOptional()
  metadata: Record<string, any>;
}
