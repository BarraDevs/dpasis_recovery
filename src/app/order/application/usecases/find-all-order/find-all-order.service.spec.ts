import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { TOKENS } from 'src/core/di/token';
import { OrderDto } from '../../dtos/order.dto';
import type { IOrderDao } from '../../persistence/dao/order-dao.interface';
import { FindAllOrder } from './find-all-order.service';

describe('FindAllOrder - Unit tests', () => {
  let sut: FindAllOrder;
  let orderDao: IOrderDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        FindAllOrder,
        { provide: TOKENS.OrderDao, useValue: createMock<IOrderDao>() },
      ],
    }).compile();

    sut = module.get(FindAllOrder);
    orderDao = module.get(TOKENS.OrderDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should return the pagination dto', async() => {
    const row = createMock<OrderDto>({ id: 1 });
    jest.spyOn(orderDao, 'findAll').mockResolvedValue([[row], 1]);

    const result = await sut.execute({ page: 1, size: 10, search: 'ORC' });

    expect(result.totalItems).toBe(1);
    expect(result.data).toEqual([row]);
  });
});
