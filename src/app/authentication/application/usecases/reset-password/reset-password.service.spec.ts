import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { AccountWithSensitiveDataDto } from 'src/app/account/application/dtos/account.dto';
import { FindAccountByCredential } from 'src/app/account/application/usecases/find-account-by-credential/find-account-by-credential.service';
import { ResetAccountPassword } from 'src/app/account/application/usecases/reset-account-password/reset-account-password.service';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { AccountStatus } from 'src/app/account/domain/enums/account-status.enum';
import { PasswordResetToken } from 'src/shared/value-objects/password-reset-token/password-reset-token.vo';
import { InvalidPasswordResetTokenError } from '../../errors/invalid-password-reset-token.error';
import { ResetPasswordInputDto } from './dtos/reset-password.dto';
import { ResetPassword } from './reset-password.service';

function makeResetPasswordInput(overrides: Partial<ResetPasswordInputDto> = {}): ResetPasswordInputDto {
  return {
    email: 'jhondoe@email.com',
    token: 'plain-token',
    password: 'new-password',
    ...overrides,
  };
}

function makeAccount(overrides: Partial<AccountWithSensitiveDataDto> = {}): AccountWithSensitiveDataDto {
  return {
    id: 1,
    name: 'Jhon Doe',
    email: 'jhondoe@email.com',
    password: 'hashed-password',
    passwordResetToken: PasswordResetToken.hash('plain-token'),
    passwordResetTokenExpiresAt: new Date(Date.now() + 60_000),
    role: AccountRole.ADMIN,
    status: AccountStatus.ACTIVE,
    ...overrides,
  };
}

describe('ResetPassword - Unit tests', () => {
  let sut: ResetPassword;
  let findAccountByCredential: FindAccountByCredential;
  let resetAccountPassword: ResetAccountPassword;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        ResetPassword,
        {
          provide: FindAccountByCredential,
          useValue: createMock<FindAccountByCredential>(),
        },
        {
          provide: ResetAccountPassword,
          useValue: createMock<ResetAccountPassword>(),
        },
      ],
    }).compile();

    sut = module.get(ResetPassword);
    findAccountByCredential = module.get(FindAccountByCredential);
    resetAccountPassword = module.get(ResetAccountPassword);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw an error if account is not found', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(null);

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(resetAccountPassword.execute).not.toHaveBeenCalled();
    });
  });

  it('should throw an error if account has another role', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount({ role: AccountRole.SELLER }));

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(resetAccountPassword.execute).not.toHaveBeenCalled();
    });
  });

  it.each(
    [
      AccountStatus.INACTIVE,
      AccountStatus.PENDING,
    ]
  )('should throw an error if account status is %s', async(status: AccountStatus) => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount({ status }));

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(resetAccountPassword.execute).not.toHaveBeenCalled();
    });
  });

  it('should throw an error if no reset was requested for the account', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(
      makeAccount({ passwordResetToken: null, passwordResetTokenExpiresAt: null }),
    );

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(resetAccountPassword.execute).not.toHaveBeenCalled();
    });
  });

  it('should throw an error if the token expired', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(
      makeAccount({ passwordResetTokenExpiresAt: new Date(Date.now() - 1_000) }),
    );

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(resetAccountPassword.execute).not.toHaveBeenCalled();
    });
  });

  it('should throw an error if the token does not match', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount());

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput({ token: 'another-token' }), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(resetAccountPassword.execute).not.toHaveBeenCalled();
    });
  });

  it('should reset the password when the token is valid', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount());

    // Act
    const result = await sut.execute(makeResetPasswordInput(), AccountRole.ADMIN);

    // Assert
    expect(result).toEqual({ message: 'Senha redefinida com sucesso.' });
    expect(resetAccountPassword.execute).toHaveBeenCalledWith(1, 'new-password');
  });
});
