import { Controller, Post, Body, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDTO } from '../../domain/user/dto/create-user.dto';
import { LoginDTO } from '../../domain/user/dto/login.dto';
import { LoginQuery } from '../../domain/user/query/login.query';
import { CreateUserCommand } from '../../domain/user/command/create-user.command';
import { RefreshTokenCommand } from 'src/domain/user/command/refresh-token.command';
import { RefreshTokenDTO } from 'src/domain/user/dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post('login')
  login(@Body() loginDto: LoginDTO) {
    return this.queryBus.execute(
      new LoginQuery(loginDto.username, loginDto.password),
    );
  }

  @Post('register')
  register(@Body() dto: CreateUserDTO) {
    return this.commandBus.execute(
      new CreateUserCommand(
        dto.username,
        dto.email,
        dto.password,
        dto.metadata,
      ),
    );
  }

  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDTO) {
    return this.queryBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }
}
