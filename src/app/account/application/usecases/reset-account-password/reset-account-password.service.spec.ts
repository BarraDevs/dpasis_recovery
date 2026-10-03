import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { TOKENS } from 'src/core/di/token';
import { Password } from 'src/shared/value-objects/password/password.vo';
import { IAccountDao } from '../../persistence/dao/account-dao.interface';
import { ResetAccountPassword } from './reset-account-password.service';

describe('ResetAccountPassword - Unit tests', () => {
  let sut: ResetAccountPassword;
  let accountDao: IAccountDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        ResetAccountPassword,
        {
          provide: TOKENS.AccountDao,
          useValue: createMock<IAccountDao>(),
        },
      ],
    }).compile();

    sut = module.get(ResetAccountPassword);
    accountDao = module.get(TOKENS.AccountDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should hash the new password before handing it to the dao', async() => {
    // Arrange
    const resetPasswordSpy = jest.spyOn(accountDao, 'resetPassword').mockResolvedValue();

    // Act
    await sut.execute(1, 'new-password');

    // Assert
    expect(resetPasswordSpy).toHaveBeenCalledTimes(1);
    const [accountId, storedPassword] = resetPasswordSpy.mock.calls[0];
    expect(accountId).toBe(1);
    expect(storedPassword).not.toBe('new-password');
    expect(Password.compare('new-password', storedPassword)).toBe(true);
  });
});
