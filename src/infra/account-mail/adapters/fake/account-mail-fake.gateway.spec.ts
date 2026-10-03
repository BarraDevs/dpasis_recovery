import { ExternalApiError } from 'src/shared/errors/external-api.error';
import { SendPasswordResetMailInputDto } from '../../dtos/account-mail.dto';
import { AccountMailFakeAdapterGateway } from './account-mail-fake.gateway';

function makeSendPasswordResetMailInput(overrides: Partial<SendPasswordResetMailInputDto> = {}): SendPasswordResetMailInputDto {
  return {
    to: 'jhondoe@email.com',
    name: 'Jhon Doe',
    token: 'plain-token',
    expiresInMinutes: 60,
    ...overrides,
  };
}

describe('AccountMailFakeAdapterGateway - Unit tests', () => {
  let sut: AccountMailFakeAdapterGateway;

  beforeEach(() => {
    sut = new AccountMailFakeAdapterGateway();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should record every password reset mail it is asked to send', async() => {
    // Arrange
    const input = makeSendPasswordResetMailInput();

    // Act
    await sut.sendPasswordReset(input);

    // Assert
    expect(sut.sentPasswordResets).toEqual([input]);
  });

  it('should throw ExternalApiError and record nothing when delivery is disabled', async() => {
    // Arrange
    sut.deliver = false;

    // Act & Assert
    expect.assertions(2);
    return sut.sendPasswordReset(makeSendPasswordResetMailInput()).catch((error) => {
      expect(error).toBeInstanceOf(ExternalApiError);
      expect(sut.sentPasswordResets).toHaveLength(0);
    });
  });
});
