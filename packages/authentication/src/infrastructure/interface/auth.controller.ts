import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Headers,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
import { ICustomController } from '../../domain/controller/icustom-controller';
import { AccessTokenGuard } from '../guard/access-token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GoogleLoginCommand } from '../../domain/user/command/google-login.command';
import { GoogleLoginDTO } from '../../domain/user/dto/google-login.dto';
import { UserType } from '../../domain/user/user-entity';

@Controller('auth')
export class AuthController implements ICustomController {
  @Inject() private readonly commandBus: CommandBus;
  @Inject() private readonly queryBus: QueryBus;

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDTO) {
    return this.queryBus.execute(
      new LoginQuery(loginDto.username, loginDto.password),
    );
  }

  @Post('google-login')
  @HttpCode(200)
  async googleLogin(@Body() dto: GoogleLoginDTO) {
    return this.commandBus.execute(new GoogleLoginCommand(dto.token));
  }

  @Post('register')
  register(@Body() dto: CreateUserDTO) {
    return this.commandBus.execute(
      new CreateUserCommand(
        dto.username,
        dto.password,
        UserType.PASSWORD,
        dto.metadata,
      ),
    );
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('refresh-token')
  @HttpCode(201)
  refreshToken(@Body() dto: RefreshTokenDTO) {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  me(@Headers('authorization') authorization: string) {
    const accessToken = extractTokenFromHeader(authorization);
    return this.queryBus.execute(new MeQuery(accessToken));
  }
}
