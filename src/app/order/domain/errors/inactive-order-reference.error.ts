import { AppException } from 'src/core/filters/app.exception';

export class InactiveOrderReferenceError extends AppException {
  constructor(subject: 'cliente' | 'empresa' | 'vendedor' | 'produto' | 'serviço') {
    super(`O ${subject} informado está inativo.`, 400);
    this.name = 'InactiveOrderReferenceError';
  }
}
