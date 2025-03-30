import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDTO } from '../../domain/user/dto/create-user.dto';
import { LoginDTO } from '../../domain/user/dto/login.dto';
import { LoginQuery } from '../../domain/user/query/login.query';
import { CreateUserCommand } from '../../domain/user/command/create-user.command';
import { RefreshTokenCommand } from '../../domain/user/command/refresh-token.command';
import { RefreshTokenDTO } from '../../domain/user/dto/refresh-token.dto';
import { MeQuery } from '../../domain/user/query/me.query';
import { extractTokenFromHeader } from '../../shared/utils/token.util';

@Controller('auth')
export class AuthController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post('login')
  @HttpCode(200)
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
  @HttpCode(201)
  refreshToken(@Body() dto: RefreshTokenDTO) {
    return this.queryBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Get('me')
  me(@Headers('authorization') authorization: string) {
    const accessToken = extractTokenFromHeader(authorization);
    return this.queryBus.execute(new MeQuery(accessToken));
  }
}
