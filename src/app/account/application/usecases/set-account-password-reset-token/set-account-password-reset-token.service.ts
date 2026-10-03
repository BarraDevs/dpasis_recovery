import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from 'src/core/di/token';
import type { IAccountDao } from '../../persistence/dao/account-dao.interface';

@Injectable()
export class SetAccountPasswordResetToken {
  constructor(
    @Inject(TOKENS.AccountDao) private readonly accountDao: IAccountDao,
  ) {}

  /** Grava o **hash** do token (nunca o valor em claro) e o instante em que ele deixa de valer. */
  public async execute(accountId: number, passwordResetTokenHash: string, expiresAt: Date): Promise<void> {
    await this.accountDao.forgotPassword(accountId, passwordResetTokenHash, expiresAt);
  }
}
