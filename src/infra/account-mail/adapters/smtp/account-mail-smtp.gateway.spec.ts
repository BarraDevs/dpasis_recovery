import { createMock } from '@golevelup/ts-jest';
import { createTransport } from 'nodemailer';
import { ConfigService } from 'src/core/config/config.service';
import { LogContext, type ILoggerGateway } from 'src/infra/logger/logger.gateway';
import { ExternalApiError } from 'src/shared/errors/external-api.error';
import { SendPasswordResetMailInputDto } from '../../dtos/account-mail.dto';
import { AccountMailSmtpAdapterGateway } from './account-mail-smtp.gateway';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const mockedCreateTransport = createTransport as jest.MockedFunction<typeof createTransport>;

function makeSendPasswordResetMailInput(overrides: Partial<SendPasswordResetMailInputDto> = {}): SendPasswordResetMailInputDto {
  return {
    to: 'jhondoe@email.com',
    name: 'Jhon Doe',
    token: 'plain-token',
    expiresInMinutes: 60,
    ...overrides,
  };
}

describe('AccountMailSmtpAdapterGateway - Unit tests', () => {
  let sut: AccountMailSmtpAdapterGateway;
  let configService: ConfigService;
  let logger: ILoggerGateway;
  let sendMail: jest.Mock;

  beforeEach(() => {
    sendMail = jest.fn().mockResolvedValue({ messageId: '1' });
    mockedCreateTransport.mockReset().mockReturnValue({ sendMail } as any);

    configService = createMock<ConfigService>({
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpFrom: 'from@example.com',
      smtpUsername: 'user',
      smtpPassword: 'pass',
      passwordResetUrl: 'https://portal.example.com/reset-password',
    });
    logger = createMock<ILoggerGateway>();
    sut = new AccountMailSmtpAdapterGateway(configService, logger);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should send the mail to the account owner with a link carrying email and token', async() => {
    // Arrange
    const input = makeSendPasswordResetMailInput({ to: 'jhon+doe@email.com', token: 'abc123' });

    // Act
    await sut.sendPasswordReset(input);

    // Assert
    expect(mockedCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'user', pass: 'pass' },
    });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][0];
    expect(mail.from).toBe('from@example.com');
    expect(mail.to).toBe('jhon+doe@email.com');
    expect(mail.subject).toBe('Redefinição de senha');
    expect(mail.text).toContain('https://portal.example.com/reset-password?email=jhon%2Bdoe%40email.com&token=abc123');
    expect(mail.text).toContain('60 minutos');
  });

  it('should use secure true when smtp port is 465', async() => {
    // Arrange
    Object.defineProperty(configService, 'smtpPort', { get: () => 465 });

    // Act
    await sut.sendPasswordReset(makeSendPasswordResetMailInput());

    // Assert
    expect(mockedCreateTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true }));
  });

  it('should reuse the transporter across sends', async() => {
    // Act
    await sut.sendPasswordReset(makeSendPasswordResetMailInput());
    await sut.sendPasswordReset(makeSendPasswordResetMailInput());

    // Assert
    expect(mockedCreateTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it('should log without the token when the mail is sent', async() => {
    // Act
    await sut.sendPasswordReset(makeSendPasswordResetMailInput({ token: 'secret-token' }));

    // Assert
    expect(logger.debug).toHaveBeenCalledWith(LogContext.SMTP, {
      adapter: 'smtp',
      action: 'sendPasswordReset',
      body: { to: 'jhondoe@email.com' },
    });
  });

  it('should log the error and throw ExternalApiError when sendMail fails', async() => {
    // Arrange
    const error = new Error('SMTP down');
    sendMail.mockRejectedValue(error);

    // Act & Assert
    expect.assertions(3);
    return sut.sendPasswordReset(makeSendPasswordResetMailInput({ token: 'secret-token' })).catch((thrown) => {
      expect(thrown).toBeInstanceOf(ExternalApiError);
      expect(logger.error).toHaveBeenCalledWith(LogContext.SMTP, {
        adapter: 'smtp',
        action: 'sendPasswordReset',
        body: { to: 'jhondoe@email.com' },
        error,
      });
      expect(JSON.stringify(jest.mocked(logger.error).mock.calls)).not.toContain('secret-token');
    });
  });
});
