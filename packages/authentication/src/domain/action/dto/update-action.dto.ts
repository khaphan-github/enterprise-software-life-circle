import { CreateActionDTO } from './create-action.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateActionDTO extends CreateActionDTO {
  @ApiProperty({ description: 'The unique identifier of the action' })
  @IsNotEmpty({ message: 'ID should not be empty' })
  id: string;
}
