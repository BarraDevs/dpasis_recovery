import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from 'src/core/di/token';
import { IPagination, Pagination } from 'src/shared/value-objects/pagination/pagination.vo';
import { OrderDto } from '../../dtos/order.dto';
import type { IOrderDao } from '../../persistence/dao/order-dao.interface';
import { FindAllOrderQueryDto } from './dtos/find-all-order.dto';

@Injectable()
export class FindAllOrder {
  constructor(
    @Inject(TOKENS.OrderDao) private readonly orderDao: IOrderDao,
  ) {}

  public async execute(queries: FindAllOrderQueryDto): Promise<IPagination<OrderDto>> {
    const [rows, total] = await this.orderDao.findAll(queries);
    return new Pagination(rows, total, queries.page, queries.size).getDto();
  }
}
