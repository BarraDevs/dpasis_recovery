import { AppException } from 'src/core/filters/app.exception';

/**
 * Mensagem única para conta inexistente, perfil errado, conta inativa, token errado e token vencido:
 * distinguir os casos diria a quem está tentando adivinhar qual deles aconteceu.
 */
export class InvalidPasswordResetTokenError extends AppException {
  constructor() {
    super('Link de redefinição de senha inválido ou expirado.', 400);
    this.name = 'InvalidPasswordResetTokenError';
  }
}
