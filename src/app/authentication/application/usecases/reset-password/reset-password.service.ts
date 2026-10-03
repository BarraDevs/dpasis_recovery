import { Injectable } from '@nestjs/common';
import { FindAccountByCredential } from 'src/app/account/application/usecases/find-account-by-credential/find-account-by-credential.service';
import { ResetAccountPassword } from 'src/app/account/application/usecases/reset-account-password/reset-account-password.service';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { Account } from 'src/app/account/domain/value-objects/account.vo';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import { PasswordResetToken } from 'src/shared/value-objects/password-reset-token/password-reset-token.vo';
import { InvalidPasswordResetTokenError } from '../../errors/invalid-password-reset-token.error';
import { ResetPasswordInputDto } from './dtos/reset-password.dto';

@Injectable()
export class ResetPassword {
  constructor(
    private readonly findAccountByCredential: FindAccountByCredential,
    private readonly resetAccountPassword: ResetAccountPassword,
  ) {}

  /**
   * Todas as recusas lançam o mesmo erro (ver `InvalidPasswordResetTokenError`). A troca limpa o
   * token junto com a senha, então o link só funciona uma vez.
   */
  public async execute(data: ResetPasswordInputDto, role: AccountRole): Promise<SuccessMessage> {
    const accountData = await this.findAccountByCredential.execute(data.email);
    if (!accountData || accountData.role !== role) {
      throw new InvalidPasswordResetTokenError();
    }

    const account = new Account(accountData.role, accountData.status);
    if (!account.isActive) {
      throw new InvalidPasswordResetTokenError();
    }

    const { passwordResetToken, passwordResetTokenExpiresAt } = accountData;
    if (!passwordResetToken || !passwordResetTokenExpiresAt) {
      throw new InvalidPasswordResetTokenError();
    }
    if (passwordResetTokenExpiresAt.getTime() <= Date.now()) {
      throw new InvalidPasswordResetTokenError();
    }
    if (!PasswordResetToken.matches(data.token, passwordResetToken)) {
      throw new InvalidPasswordResetTokenError();
    }

    await this.resetAccountPassword.execute(accountData.id, data.password);

    return { message: 'Senha redefinida com sucesso.' };
  }
}
