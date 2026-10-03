import { Test } from '@nestjs/testing';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { AccountStatus } from 'src/app/account/domain/enums/account-status.enum';
import { AuthenticationModule } from 'src/app/authentication/authentication.module';
import { TOKENS } from 'src/core/di/token';
import { AccountMailFakeAdapterGateway } from 'src/infra/account-mail/adapters/fake/account-mail-fake.gateway';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { Password } from 'src/shared/value-objects/password/password.vo';
import { PasswordResetToken } from 'src/shared/value-objects/password-reset-token/password-reset-token.vo';
import { InvalidCredentialError } from '../../errors/invalid-credential.error';
import { InvalidPasswordResetTokenError } from '../../errors/invalid-password-reset-token.error';
import { ForgotPassword } from '../forgot-password/forgot-password.service';
import { SignInWithCredentialAndPassword } from '../signin-with-credential-and-password/signin-with-credential-and-password.service';
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

describe('ResetPassword - Integration tests', () => {
  let sut: ResetPassword;
  let forgotPassword: ForgotPassword;
  let signInWithCredentialAndPassword: SignInWithCredentialAndPassword;
  let prisma: PrismaService;
  let accountMailGateway: AccountMailFakeAdapterGateway;

  async function createAccount(overrides: {
    role?: AccountRole;
    status?: AccountStatus;
    passwordResetToken?: string | null;
    passwordResetTokenExpiresAt?: Date | null;
  } = {}) {
    return prisma.account.create({
      data: {
        name: 'Jhon Doe',
        email: 'jhondoe@email.com',
        password: new Password('old-password').value,
        role: overrides.role ?? AccountRole.ADMIN,
        status: overrides.status ?? AccountStatus.ACTIVE,
        passwordResetToken: overrides.passwordResetToken === undefined
          ? PasswordResetToken.hash('plain-token')
          : overrides.passwordResetToken,
        passwordResetTokenExpiresAt: overrides.passwordResetTokenExpiresAt === undefined
          ? new Date(Date.now() + 60_000)
          : overrides.passwordResetTokenExpiresAt,
      },
    });
  }

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [AuthenticationModule],
    }).compile();

    sut = module.get(ResetPassword);
    forgotPassword = module.get(ForgotPassword);
    signInWithCredentialAndPassword = module.get(SignInWithCredentialAndPassword);
    prisma = module.get(PrismaService);
    accountMailGateway = module.get(TOKENS.AccountMailGateway) as AccountMailFakeAdapterGateway;
  });

  beforeEach(async() => {
    await prisma.truncate();
    accountMailGateway.sentPasswordResets.splice(0);
    accountMailGateway.deliver = true;
  });

  afterAll(async() => {
    await prisma.truncate();
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw an error if account is not found', async() => {
    // Act & Assert
    expect.assertions(1);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
    });
  });

  it('should throw an error if account has another role', async() => {
    // Arrange
    await createAccount({ role: AccountRole.SELLER });

    // Act & Assert
    expect.assertions(1);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
    });
  });

  it('should throw an error if account is not active', async() => {
    // Arrange
    await createAccount({ status: AccountStatus.INACTIVE });

    // Act & Assert
    expect.assertions(1);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
    });
  });

  it('should throw an error if no reset was requested', async() => {
    // Arrange
    await createAccount({ passwordResetToken: null, passwordResetTokenExpiresAt: null });

    // Act & Assert
    expect.assertions(1);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
    });
  });

  it('should throw an error and keep the password if the token expired', async() => {
    // Arrange
    const account = await createAccount({ passwordResetTokenExpiresAt: new Date(Date.now() - 1_000) });

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput(), AccountRole.ADMIN).catch(async(error) => {
      const stored = await prisma.account.findUnique({ where: { id: account.id } });
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(Password.compare('old-password', stored!.password)).toBe(true);
    });
  });

  it('should throw an error and keep the password if the token does not match', async() => {
    // Arrange
    const account = await createAccount();

    // Act & Assert
    expect.assertions(2);
    return sut.execute(makeResetPasswordInput({ token: 'another-token' }), AccountRole.ADMIN).catch(async(error) => {
      const stored = await prisma.account.findUnique({ where: { id: account.id } });
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
      expect(Password.compare('old-password', stored!.password)).toBe(true);
    });
  });

  it('should reset the password and consume the token', async() => {
    // Arrange
    const account = await createAccount();

    // Act
    const result = await sut.execute(makeResetPasswordInput(), AccountRole.ADMIN);

    // Assert
    const stored = await prisma.account.findUnique({ where: { id: account.id } });
    expect(result).toEqual({ message: 'Senha redefinida com sucesso.' });
    expect(Password.compare('new-password', stored!.password)).toBe(true);
    expect(stored?.passwordResetToken).toBeNull();
    expect(stored?.passwordResetTokenExpiresAt).toBeNull();
  });

  it('should not accept the same token twice', async() => {
    // Arrange
    await createAccount();
    await sut.execute(makeResetPasswordInput(), AccountRole.ADMIN);

    // Act & Assert
    expect.assertions(1);
    return sut.execute(makeResetPasswordInput({ password: 'another-password' }), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(InvalidPasswordResetTokenError);
    });
  });

  it('should let the user sign in only with the new password after the forgot -> reset flow', async() => {
    // Arrange
    await createAccount({ passwordResetToken: null, passwordResetTokenExpiresAt: null });
    await forgotPassword.execute({ email: 'jhondoe@email.com' }, AccountRole.ADMIN);
    const [mail] = accountMailGateway.sentPasswordResets;

    // Act
    await sut.execute({ email: 'jhondoe@email.com', token: mail.token, password: 'new-password' }, AccountRole.ADMIN);

    // Assert
    const signIn = await signInWithCredentialAndPassword.execute({ credential: 'jhondoe@email.com', password: 'new-password' });
    expect(signIn.accessToken).not.toBeNull();
    await expect(
      signInWithCredentialAndPassword.execute({ credential: 'jhondoe@email.com', password: 'old-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialError);
  });
});
