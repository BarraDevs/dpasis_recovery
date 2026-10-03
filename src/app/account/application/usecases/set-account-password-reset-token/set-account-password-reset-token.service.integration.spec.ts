import { Test } from '@nestjs/testing';
import { AccountModule } from 'src/app/account/account.module';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { AccountStatus } from 'src/app/account/domain/enums/account-status.enum';
import { ConfigModule } from 'src/core/config/config.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { SetAccountPasswordResetToken } from './set-account-password-reset-token.service';

describe('SetAccountPasswordResetToken - Integration tests', () => {
  let sut: SetAccountPasswordResetToken;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [
        AccountModule,
        ConfigModule,
      ],
    }).compile();

    sut = module.get(SetAccountPasswordResetToken);
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

  it('should persist the token hash and its expiration without touching the password', async() => {
    // Arrange
    const account = await prisma.account.create({
      data: {
        name: 'Jhon Doe',
        email: 'jhondoe@email.com',
        password: 'hashedpassword',
        status: AccountStatus.ACTIVE,
        role: AccountRole.ADMIN,
      },
    });
    const expiresAt = new Date('2030-01-01T11:00:00.000Z');

    // Act
    await sut.execute(account.id, 'token-hash', expiresAt);

    // Assert
    const updated = await prisma.account.findUnique({ where: { id: account.id } });
    expect(updated?.passwordResetToken).toBe('token-hash');
    expect(updated?.passwordResetTokenExpiresAt).toEqual(expiresAt);
    expect(updated?.password).toBe('hashedpassword');
  });
});
