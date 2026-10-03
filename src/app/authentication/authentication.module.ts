/**
 * Módulo de autenticação (JWT, sign-in). Importa {@link AuthenticationGuardsModule}, que por sua vez
 * expõe o stack CASL (`AuthorizationCaslModule`) para uso nas rotas protegidas.
 */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccountModule } from '../account/account.module';
import { AccountMailModule } from 'src/infra/account-mail/account-mail.module';
import { AuthenticationGuardsModule } from './application/guards/guards.module';
import { ForgotPassword } from './application/usecases/forgot-password/forgot-password.service';
import { ResetPassword } from './application/usecases/reset-password/reset-password.service';
import { SignInWithCredentialAndPassword } from './application/usecases/signin-with-credential-and-password/signin-with-credential-and-password.service';
import { AuthenticationController } from './infra/drivers/http/authentication.controller';
import { JwtAuthModule } from './infra/strategies/jwt/jwt.module';

@Module({
  imports: [
    JwtAuthModule,
    PassportModule,
    AccountModule,
    AccountMailModule.register(),
    AuthenticationGuardsModule,
  ],
  controllers: [
    AuthenticationController,
  ],
  providers: [
    ForgotPassword,
    ResetPassword,
    SignInWithCredentialAndPassword,
  ],
})
export class AuthenticationModule {}
