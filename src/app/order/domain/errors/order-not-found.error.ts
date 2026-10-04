import { AppException } from 'src/core/filters/app.exception';

export class OrderNotFoundError extends AppException {
  constructor() {
    super('Orçamento não encontrado na base de dados.', 404);
    this.name = 'OrderNotFoundError';
  }
}
