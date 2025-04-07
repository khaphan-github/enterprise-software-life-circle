import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserRolesQuery } from '../../domain/user-role/query/get-user-roles.query';
import { AssignRolesToUserCommand } from '../../domain/user-role/command/assign-roles-to-user.command';
import { RemoveRolesFromUserCommand } from '../../domain/user-role/command/remove-roles-from-user.command';
import { BulkAssignRolesCommand } from '../../domain/user-role/command/bulk-assign-roles.command';

@Controller('user-roles')
export class UserRoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':userId/roles')
  async getUserRoles(@Param('userId') userId: string) {
    const roles = await this.queryBus.execute(new GetUserRolesQuery(userId));
    if (!roles) {
      throw new HttpException('Roles not found', HttpStatus.NOT_FOUND);
    }
    return roles;
  }

  @Post(':userId/roles')
  async assignRolesToUser(
    @Param('userId') userId: string,
    @Body() roleIds: string[],
  ) {
    return this.commandBus.execute(
      new AssignRolesToUserCommand(userId, roleIds),
    );
  }

  @Delete(':userId/roles')
  async removeRolesFromUser(
    @Param('userId') userId: string,
    @Body() roleIds: string[],
  ) {
    return this.commandBus.execute(
      new RemoveRolesFromUserCommand(userId, roleIds),
    );
  }

  @Post('bulk')
  async bulkAssignRoles(
    @Body() assignments: { userId: string; roleIds: string[] }[],
  ) {
    return this.commandBus.execute(new BulkAssignRolesCommand(assignments));
  }
}
