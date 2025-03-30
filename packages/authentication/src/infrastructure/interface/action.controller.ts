import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Inject,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateActionDTO } from '../../domain/action/dto/create-action.dto';
import { UpdateActionDTO } from '../../domain/action/dto/update-action.dto';
import { DeleteActionDTO } from '../../domain/action/dto/delete-action.dto';
import { CreateActionsCommand } from '../../domain/action/commands/create-actions.command';
import { UpdateActionsCommand } from '../../domain/action/commands/update-actions.command';
import { DeleteActionsCommand } from '../../domain/action/commands/delete-actions.command';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../guard/access-token.guard';

@Controller('actions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ActionController {
  @Inject() private readonly commandBus: CommandBus;

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateActionDTO[]) {
    return this.commandBus.execute(new CreateActionsCommand(dto));
  }

  @Put()
  @HttpCode(200)
  async update(@Body() dto: UpdateActionDTO[]) {
    return this.commandBus.execute(new UpdateActionsCommand(dto));
  }

  @Delete()
  @HttpCode(204)
  async delete(@Body() dto: DeleteActionDTO) {
    await this.commandBus.execute(new DeleteActionsCommand(dto.ids));
  }
}
