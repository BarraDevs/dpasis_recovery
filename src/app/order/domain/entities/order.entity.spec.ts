import { ItemType } from '../enums/item-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { InvalidOrderStatusTransitionError } from '../errors/invalid-order-status-transition.error';
import { OrderCannotBeDeletedError } from '../errors/order-cannot-be-deleted.error';
import { OrderCannotBeEditedError } from '../errors/order-cannot-be-edited.error';
import { OrderItem } from './order-item.entity';
import { Order, OrderProps } from './order.entity';

function makeItem(total = 1000): OrderItem {
  return OrderItem.create({
    type: ItemType.PRODUCT,
    productId: 1,
    serviceId: null,
    code: 'PRD-1',
    description: 'Leitor',
    serviceActivityCode: null,
    quantity: 1,
    unitValueInCents: total,
    lastAdjustment: null,
  });
}

function makeProps(overrides: Partial<OrderProps> = {}): OrderProps {
  return {
    id: 1,
    code: 'ORC-2026-001',
    clientId: 1,
    companyId: 1,
    sellerId: null,
    freightMode: null,
    carrierName: null,
    freightValueInCents: 0,
    commercialProcess: null,
    observation: null,
    commercialNote: null,
    status: OrderStatus.QUOTATION,
    totalItemsInCents: 1000,
    totalValueInCents: 1000,
    active: true,
    items: [makeItem().props],
    ...overrides,
  };
}

describe('Order - Unit tests', () => {
  let sut: Order;

  beforeEach(() => {
    sut = Order._instantiate(makeProps());
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should advance one step and reject a skip', () => {
    sut.changeStatus(OrderStatus.APPROVED);
    expect(sut.props.status).toBe(OrderStatus.APPROVED);

    expect(() => sut.changeStatus(OrderStatus.INVOICING)).toThrow(InvalidOrderStatusTransitionError);
    expect(() => sut.changeStatus(OrderStatus.INVOICING)).toThrow('Não é possível mudar o status de aprovado para faturamento.');
  });

  it('should cancel before delivery and reject cancel after delivery', () => {
    sut.changeStatus(OrderStatus.CANCELED);
    expect(sut.props.status).toBe(OrderStatus.CANCELED);

    const delivered = Order._instantiate(makeProps({ status: OrderStatus.DELIVERED }));
    expect(() => delivered.changeStatus(OrderStatus.CANCELED)).toThrow(InvalidOrderStatusTransitionError);
  });

  it('should replace items and recalculate only in quotation', () => {
    sut.replaceItems([makeItem(2500)]);
    expect(sut.props.totalItemsInCents).toBe(2500);
    expect(sut.props.totalValueInCents).toBe(2500);

    const approved = Order._instantiate(makeProps({ status: OrderStatus.APPROVED }));
    expect(() => approved.replaceItems([makeItem()])).toThrow(OrderCannotBeEditedError);
  });

  it('should add freight to the total while the order is open', () => {
    sut.updateCommercial({ freightValueInCents: 500 });
    expect(sut.props.totalValueInCents).toBe(1500);

    const delivered = Order._instantiate(makeProps({ status: OrderStatus.DELIVERED }));
    expect(() => delivered.updateCommercial({ observation: 'tarde' })).toThrow(OrderCannotBeEditedError);
  });

  it('should allow delete only in quotation', () => {
    expect(() => sut.assertDeletable()).not.toThrow();
    const approved = Order._instantiate(makeProps({ status: OrderStatus.APPROVED }));
    expect(() => approved.assertDeletable()).toThrow(OrderCannotBeDeletedError);
  });
});
