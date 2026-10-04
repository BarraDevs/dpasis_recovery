import { ItemType } from '../enums/item-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderFactory } from './order.factory';

describe('OrderFactory - Unit tests', () => {
  it('should create a quotation with totals', () => {
    const sut = OrderFactory.create({
      clientId: 1,
      companyId: 2,
      sellerId: null,
      freightMode: null,
      carrierName: null,
      freightValueInCents: 200,
      commercialProcess: null,
      observation: null,
      commercialNote: null,
      items: [{
        type: ItemType.PRODUCT,
        productId: 9,
        serviceId: null,
        code: 'PRD-9',
        description: 'Leitor',
        serviceActivityCode: null,
        quantity: 2,
        unitValueInCents: 1000,
        lastAdjustment: null,
      }],
    });

    expect(sut.props.status).toBe(OrderStatus.QUOTATION);
    expect(sut.props.active).toBe(true);
    expect(sut.props.totalItemsInCents).toBe(2000);
    expect(sut.props.totalValueInCents).toBe(2200);
    expect(sut.props.items[0].code).toBe('PRD-9');
  });
});
