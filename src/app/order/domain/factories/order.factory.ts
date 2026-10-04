import { OrderStatus } from '../enums/order-status.enum';
import { Order, OrderCommercialProps, OrderProps } from '../entities/order.entity';
import { OrderItem, OrderItemCreateProps } from '../entities/order-item.entity';

export type OrderCreateProps = OrderCommercialProps & {
  clientId: number;
  companyId: number;
  sellerId: number | null;
  items: OrderItemCreateProps[];
};

export class OrderFactory {
  static create(props: OrderCreateProps): Order {
    const items = props.items.map((item) => OrderItem.create(item));
    const totalItemsInCents = items.reduce((sum, item) => sum + item.props.totalValueInCents, 0);

    return Order._instantiate({
      id: 0,
      code: '',
      clientId: props.clientId,
      companyId: props.companyId,
      sellerId: props.sellerId,
      freightMode: props.freightMode,
      carrierName: props.carrierName,
      freightValueInCents: props.freightValueInCents,
      commercialProcess: props.commercialProcess,
      observation: props.observation,
      commercialNote: props.commercialNote,
      status: OrderStatus.QUOTATION,
      totalItemsInCents,
      totalValueInCents: totalItemsInCents + props.freightValueInCents,
      active: true,
      items: items.map((item) => item.props),
    });
  }

  static load(props: OrderProps): Order {
    return Order._instantiate(props);
  }
}
