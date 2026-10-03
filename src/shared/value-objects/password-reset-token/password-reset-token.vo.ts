import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Token de redefinição de senha.
 *
 * O valor em claro só existe até o e-mail sair; no banco fica o hash SHA-256 (64 caracteres hex, o
 * que cabe em `accounts.passwordResetToken VARCHAR(64)`). Quem lê o banco não consegue redefinir a
 * senha de ninguém. SHA-256 simples basta aqui: o token tem 256 bits de entropia, então não há o que
 * um custo de bcrypt adicione contra força bruta.
 */
export class PasswordResetToken {
  public static readonly TTL_IN_MINUTES = 60;

  private readonly _plain: string;
  private readonly _hash: string;

  constructor() {
    this._plain = randomBytes(32).toString('hex');
    this._hash = PasswordResetToken.hash(this._plain);
  }

  public get plain(): string {
    return this._plain;
  }

  public get hash(): string {
    return this._hash;
  }

  public static hash(plain: string): string {
    return createHash('sha256').update(plain).digest('hex');
  }

  /** Comparação em tempo constante: o tempo de resposta não revela quantos caracteres bateram. */
  public static matches(plain: string, storedHash: string): boolean {
    const received = Buffer.from(PasswordResetToken.hash(plain), 'hex');
    const stored = Buffer.from(storedHash, 'hex');

    if (received.length !== stored.length) {
      return false;
    }

    return timingSafeEqual(received, stored);
  }

  public static calculateExpiration(from: Date = new Date()): Date {
    return new Date(from.getTime() + PasswordResetToken.TTL_IN_MINUTES * 60_000);
  }
}
