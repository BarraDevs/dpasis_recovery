import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { Order } from 'src/app/order/domain/entities/order.entity';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { OrderStatus } from 'src/app/order/domain/enums/order-status.enum';
import { OrderFactory } from 'src/app/order/domain/factories/order.factory';
import { OrderNotFoundError } from 'src/app/order/domain/errors/order-not-found.error';
import { TOKENS } from 'src/core/di/token';
import type { IOrderRepository } from '../../persistence/repository/order-repository.interface';
import { ChangeOrderStatus } from './change-order-status.service';

function makeOrder(): Order {
  return OrderFactory.create({
    clientId: 1,
    companyId: 1,
    sellerId: null,
    freightMode: null,
    carrierName: null,
    freightValueInCents: 0,
    commercialProcess: null,
    observation: null,
    commercialNote: null,
    items: [{
      type: ItemType.PRODUCT,
      productId: 1,
      serviceId: null,
      code: 'PRD',
      description: 'Item',
      serviceActivityCode: null,
      quantity: 1,
      unitValueInCents: 100,
      lastAdjustment: null,
    }],
  });
}

describe('ChangeOrderStatus - Unit tests', () => {
  let sut: ChangeOrderStatus;
  let orderRepository: IOrderRepository;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        ChangeOrderStatus,
        { provide: TOKENS.OrderRepository, useValue: createMock<IOrderRepository>() },
      ],
    }).compile();

    sut = module.get(ChangeOrderStatus);
    orderRepository = module.get(TOKENS.OrderRepository);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw OrderNotFoundError when the order does not exist', async() => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    await expect(sut.execute(1, { status: OrderStatus.APPROVED })).rejects.toThrow(OrderNotFoundError);
  });

  it('should persist the next status', async() => {
    // Arrange
    const order = makeOrder();
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    const editSpy = jest.spyOn(orderRepository, 'edit').mockResolvedValue();

    // Act
    const result = await sut.execute(1, { status: OrderStatus.APPROVED });

    // Assert
    expect(order.props.status).toBe(OrderStatus.APPROVED);
    expect(editSpy).toHaveBeenCalledWith(order);
    expect(result).toEqual({ message: 'Status do orçamento atualizado com sucesso' });
  });
});
