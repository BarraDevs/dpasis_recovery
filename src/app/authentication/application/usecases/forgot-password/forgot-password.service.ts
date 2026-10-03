import { Inject, Injectable } from '@nestjs/common';
import { FindAccountByCredential } from 'src/app/account/application/usecases/find-account-by-credential/find-account-by-credential.service';
import { SetAccountPasswordResetToken } from 'src/app/account/application/usecases/set-account-password-reset-token/set-account-password-reset-token.service';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { Account } from 'src/app/account/domain/value-objects/account.vo';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import { TOKENS } from 'src/core/di/token';
import type { IAccountMailGateway } from 'src/infra/account-mail/account-mail.gateway';
import { PasswordResetToken } from 'src/shared/value-objects/password-reset-token/password-reset-token.vo';
import { ForgotPasswordInputDto } from './dtos/forgot-password.dto';

@Injectable()
export class ForgotPassword {
  constructor(
    private readonly findAccountByCredential: FindAccountByCredential,
    private readonly setAccountPasswordResetToken: SetAccountPasswordResetToken,
    @Inject(TOKENS.AccountMailGateway) private readonly accountMailGateway: IAccountMailGateway,
  ) {}

  /**
   * A resposta é a mesma exista a conta ou não: dizer "e-mail não encontrado" transformaria a rota
   * (pública) num oráculo para descobrir quem tem cadastro. Só conta ativa e do perfil pedido recebe
   * o e-mail.
   *
   * O token é gravado **antes** do envio. Se o SMTP falhar, o erro sobe (503) e o usuário pode pedir
   * de novo — o pedido seguinte simplesmente substitui o token anterior.
   */
  public async execute(data: ForgotPasswordInputDto, role: AccountRole): Promise<SuccessMessage> {
    const message = 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.';

    const accountData = await this.findAccountByCredential.execute(data.email);
    if (!accountData || accountData.role !== role) {
      return { message };
    }

    const account = new Account(accountData.role, accountData.status);
    if (!account.isActive) {
      return { message };
    }

    const token = new PasswordResetToken();
    const expiresAt = PasswordResetToken.calculateExpiration();

    await this.setAccountPasswordResetToken.execute(accountData.id, token.hash, expiresAt);
    await this.accountMailGateway.sendPasswordReset({
      to: accountData.email,
      name: accountData.name,
      token: token.plain,
      expiresInMinutes: PasswordResetToken.TTL_IN_MINUTES,
    });

    return { message };
  }
}
