import { OrderDto } from '../../dtos/order.dto';
import { FindAllOrderQueryDto } from '../../usecases/find-all-order/dtos/find-all-order.dto';

export interface IOrderDao {
  findAll(queries: FindAllOrderQueryDto): Promise<[OrderDto[], number]>;
  findById(id: number): Promise<OrderDto | null>;
}
