import { AppException } from 'src/core/filters/app.exception';

export class OrderCannotBeDeletedError extends AppException {
  constructor() {
    super('Só é possível excluir um orçamento em cotação.', 400);
    this.name = 'OrderCannotBeDeletedError';
  }
}
