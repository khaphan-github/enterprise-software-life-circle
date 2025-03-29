import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { PoolConfig } from 'pg';
import { IRBACConf } from '../auth.module';
import { Options } from 'argon2';

@Injectable()
export class AuthConf {
  @Inject() private readonly configService: ConfigService;
  getDatabaseConfig(): PoolConfig {
    const dbConfig = this.configService.get('authRBACConfig.dbConf');
    return dbConfig;
  }

  getJwtOptions(): JwtModuleOptions {
    const jwtOptions = this.configService.get('authRBACConfig.jwtOptions');
    return jwtOptions;
  }

  getRbacConf(): IRBACConf {
    const rbacConf = this.configService.get('authRBACConfig.rbacConf');
    return rbacConf;
  }

  getHashPasswordConf(): Options {
    return {
      hashLength: 32,
      timeCost: 3,
      memoryCost: 4096,
      parallelism: 1,
      secret: Buffer.from(this.getRbacConf().authSecretKey),
      salt: Buffer.from(this.getRbacConf().authSalt),
    };
  }
}
