import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { AccountWithSensitiveDataDto } from 'src/app/account/application/dtos/account.dto';
import { FindAccountByCredential } from 'src/app/account/application/usecases/find-account-by-credential/find-account-by-credential.service';
import { SetAccountPasswordResetToken } from 'src/app/account/application/usecases/set-account-password-reset-token/set-account-password-reset-token.service';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { AccountStatus } from 'src/app/account/domain/enums/account-status.enum';
import { TOKENS } from 'src/core/di/token';
import type { IAccountMailGateway } from 'src/infra/account-mail/account-mail.gateway';
import { ExternalApiError } from 'src/shared/errors/external-api.error';
import { PasswordResetToken } from 'src/shared/value-objects/password-reset-token/password-reset-token.vo';
import { ForgotPasswordInputDto } from './dtos/forgot-password.dto';
import { ForgotPassword } from './forgot-password.service';

const GENERIC_MESSAGE = 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.';

function makeForgotPasswordInput(overrides: Partial<ForgotPasswordInputDto> = {}): ForgotPasswordInputDto {
  return {
    email: 'jhondoe@email.com',
    ...overrides,
  };
}

function makeAccount(overrides: Partial<AccountWithSensitiveDataDto> = {}): AccountWithSensitiveDataDto {
  return {
    id: 1,
    name: 'Jhon Doe',
    email: 'jhondoe@email.com',
    password: 'hashed-password',
    passwordResetToken: null,
    passwordResetTokenExpiresAt: null,
    role: AccountRole.ADMIN,
    status: AccountStatus.ACTIVE,
    ...overrides,
  };
}

describe('ForgotPassword - Unit tests', () => {
  let sut: ForgotPassword;
  let findAccountByCredential: FindAccountByCredential;
  let setAccountPasswordResetToken: SetAccountPasswordResetToken;
  let accountMailGateway: IAccountMailGateway;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        ForgotPassword,
        {
          provide: FindAccountByCredential,
          useValue: createMock<FindAccountByCredential>(),
        },
        {
          provide: SetAccountPasswordResetToken,
          useValue: createMock<SetAccountPasswordResetToken>(),
        },
        {
          provide: TOKENS.AccountMailGateway,
          useValue: createMock<IAccountMailGateway>(),
        },
      ],
    }).compile();

    sut = module.get(ForgotPassword);
    findAccountByCredential = module.get(FindAccountByCredential);
    setAccountPasswordResetToken = module.get(SetAccountPasswordResetToken);
    accountMailGateway = module.get(TOKENS.AccountMailGateway);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should answer with the generic message and send nothing if account is not found', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(null);

    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    expect(result).toEqual({ message: GENERIC_MESSAGE });
    expect(setAccountPasswordResetToken.execute).not.toHaveBeenCalled();
    expect(accountMailGateway.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('should answer with the generic message and send nothing if account has another role', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount({ role: AccountRole.SELLER }));

    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    expect(result).toEqual({ message: GENERIC_MESSAGE });
    expect(setAccountPasswordResetToken.execute).not.toHaveBeenCalled();
    expect(accountMailGateway.sendPasswordReset).not.toHaveBeenCalled();
  });

  it.each(
    [
      AccountStatus.INACTIVE,
      AccountStatus.PENDING,
    ]
  )('should answer with the generic message and send nothing if account status is %s', async(status: AccountStatus) => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount({ status }));

    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    expect(result).toEqual({ message: GENERIC_MESSAGE });
    expect(setAccountPasswordResetToken.execute).not.toHaveBeenCalled();
    expect(accountMailGateway.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('should store only the token hash and e-mail the plain token', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount());

    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    expect(result).toEqual({ message: GENERIC_MESSAGE });

    const [accountId, storedHash, expiresAt] = jest.mocked(setAccountPasswordResetToken.execute).mock.calls[0];
    expect(accountId).toBe(1);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const [mail] = jest.mocked(accountMailGateway.sendPasswordReset).mock.calls[0];
    expect(mail).toEqual({
      to: 'jhondoe@email.com',
      name: 'Jhon Doe',
      token: expect.any(String),
      expiresInMinutes: PasswordResetToken.TTL_IN_MINUTES,
    });
    expect(mail.token).not.toBe(storedHash);
    expect(PasswordResetToken.matches(mail.token, storedHash)).toBe(true);
  });

  it('should store the token before sending the mail', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount());

    // Act
    await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    const storeOrder = jest.mocked(setAccountPasswordResetToken.execute).mock.invocationCallOrder[0];
    const sendOrder = jest.mocked(accountMailGateway.sendPasswordReset).mock.invocationCallOrder[0];
    expect(storeOrder).toBeLessThan(sendOrder);
  });

  it('should propagate the error when the mail cannot be sent', async() => {
    // Arrange
    jest.spyOn(findAccountByCredential, 'execute').mockResolvedValue(makeAccount());
    jest.spyOn(accountMailGateway, 'sendPasswordReset').mockRejectedValue(new ExternalApiError('SMTP fora do ar'));

    // Act & Assert
    expect.assertions(1);
    return sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(ExternalApiError);
    });
  });
});
