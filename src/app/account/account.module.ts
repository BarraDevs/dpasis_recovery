import { Module, Provider } from '@nestjs/common';
import { AccountPersistenceModule } from './application/persistence/account-persistence.module';
import { FindAccountByCredential } from './application/usecases/find-account-by-credential/find-account-by-credential.service';
import { FindAccountById } from './application/usecases/find-account-by-id/find-account-by-id.service';
import { ResetAccountPassword } from './application/usecases/reset-account-password/reset-account-password.service';
import { SetAccountPasswordResetToken } from './application/usecases/set-account-password-reset-token/set-account-password-reset-token.service';

const providers: Provider[] = [
  FindAccountByCredential,
  FindAccountById,
  ResetAccountPassword,
  SetAccountPasswordResetToken,
];

@Module({
  imports: [
    AccountPersistenceModule,
  ],
  providers: [...providers],
  exports: [...providers],
})
export class AccountModule {}
