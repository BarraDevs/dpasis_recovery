import { Order } from 'src/app/order/domain/entities/order.entity';

export interface IOrderRepository {
  save(entity: Order): Promise<{ id: number; code: string }>;
  edit(entity: Order): Promise<void>;
  findById(id: number): Promise<Order | null>;
  delete(id: number): Promise<void>;
}
