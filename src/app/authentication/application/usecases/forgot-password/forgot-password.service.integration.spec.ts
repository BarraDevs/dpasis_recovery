import { Test } from '@nestjs/testing';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { AccountStatus } from 'src/app/account/domain/enums/account-status.enum';
import { AuthenticationModule } from 'src/app/authentication/authentication.module';
import { TOKENS } from 'src/core/di/token';
import { AccountMailFakeAdapterGateway } from 'src/infra/account-mail/adapters/fake/account-mail-fake.gateway';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
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

describe('ForgotPassword - Integration tests', () => {
  let sut: ForgotPassword;
  let prisma: PrismaService;
  let accountMailGateway: AccountMailFakeAdapterGateway;

  async function createAccount(overrides: { role?: AccountRole; status?: AccountStatus } = {}) {
    return prisma.account.create({
      data: {
        name: 'Jhon Doe',
        email: 'jhondoe@email.com',
        password: 'hashed-password',
        role: overrides.role ?? AccountRole.ADMIN,
        status: overrides.status ?? AccountStatus.ACTIVE,
      },
    });
  }

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [AuthenticationModule],
    }).compile();

    sut = module.get(ForgotPassword);
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

  it('should answer with the generic message and send nothing if account is not found', async() => {
    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    expect(result).toEqual({ message: GENERIC_MESSAGE });
    expect(accountMailGateway.sentPasswordResets).toHaveLength(0);
  });

  it('should send nothing if account has another role', async() => {
    // Arrange
    const account = await createAccount({ role: AccountRole.SELLER });

    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    const stored = await prisma.account.findUnique({ where: { id: account.id } });
    expect(result).toEqual({ message: GENERIC_MESSAGE });
    expect(accountMailGateway.sentPasswordResets).toHaveLength(0);
    expect(stored?.passwordResetToken).toBeNull();
  });

  it.each(
    [
      AccountStatus.INACTIVE,
      AccountStatus.PENDING,
    ]
  )('should send nothing if account status is %s', async(status: AccountStatus) => {
    // Arrange
    const account = await createAccount({ status });

    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    const stored = await prisma.account.findUnique({ where: { id: account.id } });
    expect(result).toEqual({ message: GENERIC_MESSAGE });
    expect(accountMailGateway.sentPasswordResets).toHaveLength(0);
    expect(stored?.passwordResetToken).toBeNull();
  });

  it('should persist the token hash with an expiration and e-mail the plain token', async() => {
    // Arrange
    const account = await createAccount();

    // Act
    const result = await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    const stored = await prisma.account.findUnique({ where: { id: account.id } });
    expect(result).toEqual({ message: GENERIC_MESSAGE });
    expect(accountMailGateway.sentPasswordResets).toHaveLength(1);

    const [mail] = accountMailGateway.sentPasswordResets;
    expect(mail.to).toBe('jhondoe@email.com');
    expect(mail.name).toBe('Jhon Doe');
    expect(stored?.passwordResetToken).not.toBe(mail.token);
    expect(PasswordResetToken.matches(mail.token, stored!.passwordResetToken!)).toBe(true);
    expect(stored?.passwordResetTokenExpiresAt!.getTime()).toBeGreaterThan(Date.now());
  });

  it('should find the account regardless of the e-mail case', async() => {
    // Arrange
    await createAccount();

    // Act
    await sut.execute(makeForgotPasswordInput({ email: 'JhonDoe@Email.com' }), AccountRole.ADMIN);

    // Assert
    expect(accountMailGateway.sentPasswordResets).toHaveLength(1);
  });

  it('should replace the previous token when a new reset is requested', async() => {
    // Arrange
    const account = await createAccount();
    await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);
    const firstStored = await prisma.account.findUnique({ where: { id: account.id } });

    // Act
    await sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN);

    // Assert
    const secondStored = await prisma.account.findUnique({ where: { id: account.id } });
    const [firstMail, secondMail] = accountMailGateway.sentPasswordResets;
    expect(secondStored?.passwordResetToken).not.toBe(firstStored?.passwordResetToken);
    expect(PasswordResetToken.matches(firstMail.token, secondStored!.passwordResetToken!)).toBe(false);
    expect(PasswordResetToken.matches(secondMail.token, secondStored!.passwordResetToken!)).toBe(true);
  });

  it('should throw ExternalApiError when the mail cannot be delivered', async() => {
    // Arrange
    await createAccount();
    accountMailGateway.deliver = false;

    // Act & Assert
    expect.assertions(1);
    return sut.execute(makeForgotPasswordInput(), AccountRole.ADMIN).catch((error) => {
      expect(error).toBeInstanceOf(ExternalApiError);
    });
  });
});
