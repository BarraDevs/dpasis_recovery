import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from 'src/core/config/config.module';
import { Environment } from 'src/core/config/environment.enum';
import { TOKENS } from 'src/core/di/token';
import { AccountMailFakeAdapterGateway } from './adapters/fake/account-mail-fake.gateway';
import { AccountMailSmtpAdapterGateway } from './adapters/smtp/account-mail-smtp.gateway';

@Module({})
export class AccountMailModule {
  static register(): DynamicModule {
    const isTest = process.env.NODE_ENV === Environment.Test;

    return {
      module: AccountMailModule,
      imports: [
        ConfigModule,
      ],
      providers: [
        {
          provide: TOKENS.AccountMailGateway,
          useClass: isTest ? AccountMailFakeAdapterGateway : AccountMailSmtpAdapterGateway,
        },
      ],
      exports: [
        TOKENS.AccountMailGateway,
      ],
    };
  }
}
