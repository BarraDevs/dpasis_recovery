import { ItemType } from '../enums/item-type.enum';
import { InvalidOrderItemError } from '../errors/invalid-order-item.error';
import { OrderItem } from './order-item.entity';

describe('OrderItem - Unit tests', () => {
  it('should round quantity times unit value', () => {
    const sut = OrderItem.create({
      type: ItemType.PRODUCT,
      productId: 1,
      serviceId: null,
      code: 'PRD-1',
      description: 'Leitor',
      serviceActivityCode: null,
      quantity: 1.5,
      unitValueInCents: 100,
      lastAdjustment: null,
    });

    expect(sut.props.totalValueInCents).toBe(150);
  });

  it('should reject an item with both catalog ids', () => {
    expect(() => OrderItem.create({
      type: ItemType.PRODUCT,
      productId: 1,
      serviceId: 2,
      code: 'X',
      description: 'Y',
      serviceActivityCode: null,
      quantity: 1,
      unitValueInCents: 10,
      lastAdjustment: null,
    })).toThrow(InvalidOrderItemError);
  });

  it('should reject a non-positive quantity', () => {
    expect(() => OrderItem.create({
      type: ItemType.SERVICE,
      productId: null,
      serviceId: 2,
      code: 'Serviço',
      description: 'Instalação',
      serviceActivityCode: null,
      quantity: 0,
      unitValueInCents: 10,
      lastAdjustment: null,
    })).toThrow('A quantidade do item deve ser maior que zero.');
  });
});
