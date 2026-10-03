import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { TOKENS } from 'src/core/di/token';
import { IAccountDao } from '../../persistence/dao/account-dao.interface';
import { SetAccountPasswordResetToken } from './set-account-password-reset-token.service';

describe('SetAccountPasswordResetToken - Unit tests', () => {
  let sut: SetAccountPasswordResetToken;
  let accountDao: IAccountDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        SetAccountPasswordResetToken,
        {
          provide: TOKENS.AccountDao,
          useValue: createMock<IAccountDao>(),
        },
      ],
    }).compile();

    sut = module.get(SetAccountPasswordResetToken);
    accountDao = module.get(TOKENS.AccountDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should call accountDao.forgotPassword with correct values', async() => {
    // Arrange
    const expiresAt = new Date('2030-01-01T11:00:00.000Z');
    const forgotPasswordSpy = jest.spyOn(accountDao, 'forgotPassword').mockResolvedValue();

    // Act
    await sut.execute(1, 'token-hash', expiresAt);

    // Assert
    expect(forgotPasswordSpy).toHaveBeenCalledWith(1, 'token-hash', expiresAt);
  });
});
