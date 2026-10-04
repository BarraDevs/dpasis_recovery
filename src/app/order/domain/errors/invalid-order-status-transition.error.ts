import { AppException } from 'src/core/filters/app.exception';
import { ORDER_STATUS_LABELS, OrderStatus } from '../enums/order-status.enum';

export class InvalidOrderStatusTransitionError extends AppException {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Não é possível mudar o status de ${ORDER_STATUS_LABELS[from]} para ${ORDER_STATUS_LABELS[to]}.`, 400);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}
