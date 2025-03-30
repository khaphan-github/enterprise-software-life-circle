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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateEndpointDTO } from '../../domain/endpoint/dto/create-endpoint.dto';
import { UpdateEndpointDTO } from '../../domain/endpoint/dto/update-endpoint.dto';
import { DeleteEndpointDTO } from '../../domain/endpoint/dto/delete-endpoint.dto';
import { UpdateEndpointsCommand } from '../../domain/endpoint/command/update-endpoints.command';
import { DeleteEndpointsCommand } from '../../domain/endpoint/command/delete-endpoints.command';
import { CreateEndpointsCommand } from '../../domain/endpoint/command/create-endpoints.command';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../infrastructure/guard/access-token.guard';

@Controller('endpoints')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class EndpointController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new endpoints' })
  @ApiResponse({
    status: 201,
    description: 'The endpoints have been successfully created.',
    schema: {
      example: [
        {
          path: '/api/example',
          method: 'GET',
          metadata: { key: 'value' },
          status: 'ACTIVE',
        },
      ],
    },
  })
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
