import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from 'src/domain/user/command/create-user.command';
import { CreateUserDTO } from 'src/domain/user/dto/create-user.dto';
import { UserTransformer } from 'src/domain/user/transformer';
import { LoginDTO } from 'src/domain/user/dto/login.dto'; // Import LoginDTO
import { LoginQuery } from 'src/domain/user/query/login.query';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDTO) {
    const result = await this.commandBus.execute(
      new CreateUserCommand(
        dto.username,
        dto.email,
        dto.password,
        dto.metadata,
      ),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return UserTransformer.toCreateSucessDTO(result);
  }

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    const { accessToken, refreshToken, user } = await this.queryBus.execute(
      new LoginQuery(dto.username, dto.password),
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      user: UserTransformer.toLoginDTO(user),
    };
  }
}
