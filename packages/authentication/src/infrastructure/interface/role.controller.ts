import { Controller, Post, Body, Inject, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRoleDto } from '../../domain/role/dto/create-role.dto';
import { CreateRoleCommand } from '../../domain/role/command/create-role.command';
import { AssignRoleToUserCommand } from '../../domain/role/command/assign-role-to-user.command';
import { AssignRoleToUserDto } from '../../domain/role/dto/assign-role-to-user.dto';

@Controller('roles')
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

  @Post('assign')
  @HttpCode(200)
  async assignRoleToUser(@Body() dto: AssignRoleToUserDto) {
    return this.commandBus.execute(
      new AssignRoleToUserCommand(dto.roleIds, dto.userIds),
    );
  }
}
