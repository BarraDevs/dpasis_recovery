import { AppException } from 'src/core/filters/app.exception';

export class InvalidOrderItemError extends AppException {
  constructor(message = 'Item inválido: informe o produto ou o serviço, nunca os dois.') {
    super(message, 400);
    this.name = 'InvalidOrderItemError';
  }
}
