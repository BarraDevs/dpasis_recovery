import { AppException } from 'src/core/filters/app.exception';

export class OrderCannotBeEditedError extends AppException {
  constructor() {
    super('Orçamento não pode ser alterado neste status.', 400);
    this.name = 'OrderCannotBeEditedError';
  }
}
