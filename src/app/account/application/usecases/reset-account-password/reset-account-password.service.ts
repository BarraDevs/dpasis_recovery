import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from 'src/core/di/token';
import { Password } from 'src/shared/value-objects/password/password.vo';
import type { IAccountDao } from '../../persistence/dao/account-dao.interface';

@Injectable()
export class ResetAccountPassword {
  constructor(
    @Inject(TOKENS.AccountDao) private readonly accountDao: IAccountDao,
  ) {}

  /**
   * Recebe a senha em claro: como ela é guardada (bcrypt) é decisão deste módulo, não de quem pede a
   * troca. O DAO limpa o token e a expiração na mesma escrita, então o link só serve uma vez.
   */
  public async execute(accountId: number, newPassword: string): Promise<void> {
    const hashedPassword = new Password(newPassword).value;

    await this.accountDao.resetPassword(accountId, hashedPassword);
  }
}
