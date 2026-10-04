import { Test } from '@nestjs/testing';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { OrderStatus } from 'src/app/order/domain/enums/order-status.enum';
import { OrderCannotBeDeletedError } from 'src/app/order/domain/errors/order-cannot-be-deleted.error';
import { OrderNotFoundError } from 'src/app/order/domain/errors/order-not-found.error';
import { OrderFactory } from 'src/app/order/domain/factories/order.factory';
import { TOKENS } from 'src/core/di/token';
import { createMock } from '@golevelup/ts-jest';
import type { IOrderRepository } from '../../persistence/repository/order-repository.interface';
import { DeleteOrder } from './delete-order.service';

describe('DeleteOrder - Unit tests', () => {
  let sut: DeleteOrder;
  let orderRepository: IOrderRepository;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        DeleteOrder,
        { provide: TOKENS.OrderRepository, useValue: createMock<IOrderRepository>() },
      ],
    }).compile();

    sut = module.get(DeleteOrder);
    orderRepository = module.get(TOKENS.OrderRepository);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw OrderNotFoundError when the order does not exist', async() => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    await expect(sut.execute(1)).rejects.toThrow(OrderNotFoundError);
  });

  it('should reject an order that left quotation', async() => {
    const order = OrderFactory.create({
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
        unitValueInCents: 10,
        lastAdjustment: null,
      }],
    });
    order.changeStatus(OrderStatus.APPROVED);
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    const deleteSpy = jest.spyOn(orderRepository, 'delete');

    await expect(sut.execute(1)).rejects.toThrow(OrderCannotBeDeletedError);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
