import {
  Controller,
  Post,
  Body,
  Inject,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRoleDto } from '../../domain/role/dto/create-role.dto';
import { CreateRoleCommand } from '../../domain/role/command/create-role.command';
import { AssignRoleToUserCommand } from '../../domain/role/command/assign-role-to-user.command';
import { AssignRoleToUserDto } from '../../domain/role/dto/assign-role-to-user.dto';
import { AssignActionToRoleCommand } from '../../domain/role/command/assign-action-to-role.command';
import { AssignEndpointToRoleCommand } from '../../domain/role/command/assign-endpoint-to-role.command';
import { AssignActionsToRoleDto } from '../../domain/role/dto/assign-actions-to-role.dto';
import { AssignEndpointsToRoleDto } from '../../domain/role/dto/assign-endpoints-to-role.dto';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../guard/access-token.guard';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RoleController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateRoleDto) {
    return this.commandBus.execute(
      new CreateRoleCommand(
        dto.name,
        dto.description,
        dto.status,
        dto.metadata,
      ),
    );
  }

  @Post('assign-user')
  @HttpCode(200)
  async assignRoleToUser(@Body() dto: AssignRoleToUserDto) {
    return this.commandBus.execute(
      new AssignRoleToUserCommand(dto.roleIds, dto.userIds),
    );
  }

  @Post('assign-actions')
  @ApiOperation({ summary: 'Assign actions to roles' })
  @ApiBody({ type: AssignActionsToRoleDto })
  async assignActionsToRole(
    @Body() dto: AssignActionsToRoleDto,
  ): Promise<void> {
    const { actionIds, roleIds } = dto;
    await this.commandBus.execute(
      new AssignActionToRoleCommand(actionIds, roleIds),
    );
  }

  @Post('assign-endpoints')
  @ApiOperation({ summary: 'Assign endpoints to roles' })
  @ApiBody({ type: AssignEndpointsToRoleDto })
  async assignEndpointsToRole(
    @Body() dto: AssignEndpointsToRoleDto,
  ): Promise<void> {
    const { endpointIds, roleIds } = dto;
    await this.commandBus.execute(
      new AssignEndpointToRoleCommand(endpointIds, roleIds),
    );
  }
}
