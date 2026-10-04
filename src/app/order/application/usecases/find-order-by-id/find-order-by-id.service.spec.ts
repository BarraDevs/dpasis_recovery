import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { OrderNotFoundError } from 'src/app/order/domain/errors/order-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { OrderDto } from '../../dtos/order.dto';
import type { IOrderDao } from '../../persistence/dao/order-dao.interface';
import { FindOrderById } from './find-order-by-id.service';

describe('FindOrderById - Unit tests', () => {
  let sut: FindOrderById;
  let orderDao: IOrderDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        FindOrderById,
        { provide: TOKENS.OrderDao, useValue: createMock<IOrderDao>() },
      ],
    }).compile();

    sut = module.get(FindOrderById);
    orderDao = module.get(TOKENS.OrderDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw OrderNotFoundError when the order does not exist', async() => {
    jest.spyOn(orderDao, 'findById').mockResolvedValue(null);
    await expect(sut.execute(1)).rejects.toThrow(OrderNotFoundError);
    await expect(sut.execute(1)).rejects.toThrow('Orçamento não encontrado na base de dados.');
  });

  it('should return the order', async() => {
    const order = createMock<OrderDto>({ id: 3, code: 'ORC-2026-001' });
    jest.spyOn(orderDao, 'findById').mockResolvedValue(order);
    await expect(sut.execute(3)).resolves.toEqual(order);
  });
});
