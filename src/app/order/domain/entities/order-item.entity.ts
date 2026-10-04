import { ItemType } from '../enums/item-type.enum';
import { InvalidOrderItemError } from '../errors/invalid-order-item.error';

export type OrderItemProps = {
  id: number;
  type: ItemType;
  productId: number | null;
  serviceId: number | null;
  code: string;
  description: string;
  serviceActivityCode: string | null;
  quantity: number;
  unitValueInCents: number;
  totalValueInCents: number;
  lastAdjustment: Date | null;
};

export type OrderItemCreateProps = Omit<OrderItemProps, 'id' | 'totalValueInCents'>;

export class OrderItem {
  private readonly _props: OrderItemProps;

  static _instantiate(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }

  private constructor(props: OrderItemProps) {
    this._props = props;
  }

  public get props(): Readonly<OrderItemProps> {
    return { ...this._props };
  }

  static create(props: OrderItemCreateProps): OrderItem {
    const hasProduct = props.productId != null;
    const hasService = props.serviceId != null;
    if (hasProduct === hasService) {
      throw new InvalidOrderItemError();
    }
    if (props.type === ItemType.PRODUCT && !hasProduct) {
      throw new InvalidOrderItemError('Item de produto precisa de productId.');
    }
    if (props.type === ItemType.SERVICE && !hasService) {
      throw new InvalidOrderItemError('Item de serviço precisa de serviceId.');
    }
    if (!(props.quantity > 0)) {
      throw new InvalidOrderItemError('A quantidade do item deve ser maior que zero.');
    }
    if (props.unitValueInCents < 0) {
      throw new InvalidOrderItemError('O valor unitário do item não pode ser negativo.');
    }

    return new OrderItem({
      ...props,
      id: 0,
      totalValueInCents: Math.round(props.quantity * props.unitValueInCents),
    });
  }
}
