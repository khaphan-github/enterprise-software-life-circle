import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRoleCommand } from 'src/domain/role/command/create-role.command';
import { CreateRoleDto } from 'src/domain/role/dto/create-role.dto';

@Controller('role')
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('create')
  async create(@Body() dto: CreateRoleDto) {
    await this.commandBus.execute(
      new CreateRoleCommand(
        dto.name,
        dto.description,
        dto.status,
        dto.metadata,
      ),
    );
    return { message: 'Role created successfully' };
  }
}
