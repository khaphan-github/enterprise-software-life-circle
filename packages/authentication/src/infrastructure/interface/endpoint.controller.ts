import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Inject,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateEndpointDTO } from '../../domain/endpoint/dto/create-endpoint.dto';
import { UpdateEndpointDTO } from '../../domain/endpoint/dto/update-endpoint.dto';
import { DeleteEndpointDTO } from '../../domain/endpoint/dto/delete-endpoint.dto';
import { UpdateEndpointsCommand } from '../../domain/endpoint/command/update-endpoints.command';
import { DeleteEndpointsCommand } from '../../domain/endpoint/command/delete-endpoints.command';
import { CreateEndpointsCommand } from '../../domain/endpoint/command/create-endpoints.command';

@Controller('endpoints')
export class EndpointController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateEndpointDTO[]) {
    return this.commandBus.execute(new CreateEndpointsCommand(dto));
  }

  @Put()
  @HttpCode(200)
  async update(@Body() dto: UpdateEndpointDTO[]) {
    return this.commandBus.execute(new UpdateEndpointsCommand(dto));
  }

  @Delete()
  @HttpCode(204)
  async delete(@Body() dto: DeleteEndpointDTO) {
    await this.commandBus.execute(new DeleteEndpointsCommand(dto.ids));
  }
}
