import { Test } from '@nestjs/testing';
import { AccountModule } from 'src/app/account/account.module';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { AccountStatus } from 'src/app/account/domain/enums/account-status.enum';
import { ConfigModule } from 'src/core/config/config.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { Password } from 'src/shared/value-objects/password/password.vo';
import { ResetAccountPassword } from './reset-account-password.service';

describe('ResetAccountPassword - Integration tests', () => {
  let sut: ResetAccountPassword;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [
        AccountModule,
        ConfigModule,
      ],
    }).compile();

    sut = module.get(ResetAccountPassword);
    prisma = module.get(PrismaService);
  });

  beforeEach(async() => {
    await prisma.truncate();
  });

  afterAll(async() => {
    await prisma.truncate();
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should store the hashed password and clear the reset token and its expiration', async() => {
    // Arrange
    const account = await prisma.account.create({
      data: {
        name: 'Jhon Doe',
        email: 'jhondoe@email.com',
        password: new Password('old-password').value,
        passwordResetToken: 'token-hash',
        passwordResetTokenExpiresAt: new Date('2030-01-01T11:00:00.000Z'),
        status: AccountStatus.ACTIVE,
        role: AccountRole.ADMIN,
      },
    });

    // Act
    await sut.execute(account.id, 'new-password');

    // Assert
    const updated = await prisma.account.findUnique({ where: { id: account.id } });
    expect(Password.compare('new-password', updated!.password)).toBe(true);
    expect(Password.compare('old-password', updated!.password)).toBe(false);
    expect(updated?.passwordResetToken).toBeNull();
    expect(updated?.passwordResetTokenExpiresAt).toBeNull();
  });
});
