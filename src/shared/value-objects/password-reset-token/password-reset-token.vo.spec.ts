import { PasswordResetToken } from './password-reset-token.vo';

describe('PasswordResetToken - Unit tests', () => {
  it('should be defined', () => {
    expect(PasswordResetToken).toBeDefined();
  });

  it('should generate a 64-char hex plain token and a 64-char hex hash', () => {
    // Act
    const sut = new PasswordResetToken();

    // Assert
    expect(sut.plain).toMatch(/^[0-9a-f]{64}$/);
    expect(sut.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should never expose the plain token as the hash', () => {
    // Act
    const sut = new PasswordResetToken();

    // Assert
    expect(sut.hash).not.toBe(sut.plain);
    expect(sut.hash).toBe(PasswordResetToken.hash(sut.plain));
  });

  it('should generate a different token on every instance', () => {
    // Act
    const first = new PasswordResetToken();
    const second = new PasswordResetToken();

    // Assert
    expect(first.plain).not.toBe(second.plain);
    expect(first.hash).not.toBe(second.hash);
  });

  describe('matches', () => {
    it('should return true when the plain token corresponds to the stored hash', () => {
      // Arrange
      const sut = new PasswordResetToken();

      // Act
      const result = PasswordResetToken.matches(sut.plain, sut.hash);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when the plain token does not correspond to the stored hash', () => {
      // Arrange
      const sut = new PasswordResetToken();

      // Act
      const result = PasswordResetToken.matches('another-token', sut.hash);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when the stored hash is malformed', () => {
      // Act
      const result = PasswordResetToken.matches('any-token', 'not-a-hash');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when the plain token is empty', () => {
      // Arrange
      const sut = new PasswordResetToken();

      // Act
      const result = PasswordResetToken.matches('', sut.hash);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('calculateExpiration', () => {
    it('should add the TTL to the given date', () => {
      // Arrange
      const from = new Date('2030-01-01T10:00:00.000Z');

      // Act
      const result = PasswordResetToken.calculateExpiration(from);

      // Assert
      expect(result).toEqual(new Date('2030-01-01T11:00:00.000Z'));
    });

    it('should not mutate the given date', () => {
      // Arrange
      const from = new Date('2030-01-01T10:00:00.000Z');

      // Act
      PasswordResetToken.calculateExpiration(from);

      // Assert
      expect(from).toEqual(new Date('2030-01-01T10:00:00.000Z'));
    });
  });
});
