import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { OrderFactory } from 'src/app/order/domain/factories/order.factory';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { OrderNotFoundError } from 'src/app/order/domain/errors/order-not-found.error';
import { TOKENS } from 'src/core/di/token';
import type { IOrderRepository } from '../../persistence/repository/order-repository.interface';
import { ActivateOrder } from './activate-order.service';

describe('ActivateOrder - Unit tests', () => {
  let sut: ActivateOrder;
  let orderRepository: IOrderRepository;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        ActivateOrder,
        { provide: TOKENS.OrderRepository, useValue: createMock<IOrderRepository>() },
      ],
    }).compile();

    sut = module.get(ActivateOrder);
    orderRepository = module.get(TOKENS.OrderRepository);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw OrderNotFoundError when the order does not exist', async() => {
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);
    await expect(sut.execute(1)).rejects.toThrow(OrderNotFoundError);
  });

  it('should activate and persist', async() => {
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
    order.deactivate();
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(order);
    const editSpy = jest.spyOn(orderRepository, 'edit').mockResolvedValue();

    const result = await sut.execute(1);

    expect(order.props.active).toBe(true);
    expect(editSpy).toHaveBeenCalledWith(order);
    expect(result).toEqual({ message: 'Orçamento ativado com sucesso' });
  });
});
