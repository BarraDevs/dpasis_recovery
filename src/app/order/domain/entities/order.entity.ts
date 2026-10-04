import { ORDER_STATUS_FLOW, OrderStatus } from '../enums/order-status.enum';
import { InvalidOrderStatusTransitionError } from '../errors/invalid-order-status-transition.error';
import { OrderCannotBeDeletedError } from '../errors/order-cannot-be-deleted.error';
import { OrderCannotBeEditedError } from '../errors/order-cannot-be-edited.error';
import { OrderItem, OrderItemProps } from './order-item.entity';

export type OrderCommercialProps = {
  freightMode: string | null;
  carrierName: string | null;
  freightValueInCents: number;
  commercialProcess: string | null;
  observation: string | null;
  commercialNote: string | null;
};

export type OrderProps = OrderCommercialProps & {
  id: number;
  code: string;
  clientId: number;
  companyId: number;
  sellerId: number | null;
  status: OrderStatus;
  totalItemsInCents: number;
  totalValueInCents: number;
  active: boolean;
  items: OrderItemProps[];
};

export class Order {
  private readonly _props: Omit<OrderProps, 'items'> & { items: OrderItem[] };

  static _instantiate(props: OrderProps): Order {
    return new Order({
      ...props,
      items: props.items.map((item) => OrderItem._instantiate(item)),
    });
  }

  private constructor(props: Omit<OrderProps, 'items'> & { items: OrderItem[] }) {
    this._props = props;
  }

  public get props(): Readonly<OrderProps> {
    return {
      ...this._props,
      items: this._props.items.map((item) => item.props),
    };
  }

  public changeStatus(next: OrderStatus): void {
    const current = this._props.status;
    if (next === OrderStatus.CANCELED) {
      if (current === OrderStatus.DELIVERED || current === OrderStatus.CANCELED) {
        throw new InvalidOrderStatusTransitionError(current, next);
      }
      this._props.status = OrderStatus.CANCELED;
      return;
    }

    const currentIndex = ORDER_STATUS_FLOW.indexOf(current);
    const nextIndex = ORDER_STATUS_FLOW.indexOf(next);
    if (currentIndex < 0 || nextIndex !== currentIndex + 1) {
      throw new InvalidOrderStatusTransitionError(current, next);
    }
    this._props.status = next;
  }

  public replaceItems(items: OrderItem[]): void {
    this.assertQuotation();
    this._props.items = items;
    this.recalculate();
  }

  public updateReferences(patch: {
    clientId?: number;
    companyId?: number;
    sellerId?: number | null;
  }): void {
    this.assertQuotation();
    if (patch.clientId !== undefined) this._props.clientId = patch.clientId;
    if (patch.companyId !== undefined) this._props.companyId = patch.companyId;
    if (patch.sellerId !== undefined) this._props.sellerId = patch.sellerId;
  }

  public updateCommercial(patch: Partial<OrderCommercialProps>): void {
    this.assertOpen();
    if (patch.freightMode !== undefined) this._props.freightMode = patch.freightMode;
    if (patch.carrierName !== undefined) this._props.carrierName = patch.carrierName;
    if (patch.freightValueInCents !== undefined) this._props.freightValueInCents = patch.freightValueInCents;
    if (patch.commercialProcess !== undefined) this._props.commercialProcess = patch.commercialProcess;
    if (patch.observation !== undefined) this._props.observation = patch.observation;
    if (patch.commercialNote !== undefined) this._props.commercialNote = patch.commercialNote;
    this.recalculate();
  }

  public activate(): void {
    this._props.active = true;
  }

  public deactivate(): void {
    this._props.active = false;
  }

  public assertDeletable(): void {
    if (this._props.status !== OrderStatus.QUOTATION) {
      throw new OrderCannotBeDeletedError();
    }
  }

  public assignCode(code: string): void {
    this._props.code = code;
  }

  private assertQuotation(): void {
    if (this._props.status !== OrderStatus.QUOTATION) {
      throw new OrderCannotBeEditedError();
    }
  }

  private assertOpen(): void {
    if (this._props.status === OrderStatus.DELIVERED || this._props.status === OrderStatus.CANCELED) {
      throw new OrderCannotBeEditedError();
    }
  }

  private recalculate(): void {
    const totalItems = this._props.items.reduce((sum, item) => sum + item.props.totalValueInCents, 0);
    this._props.totalItemsInCents = totalItems;
    this._props.totalValueInCents = totalItems + this._props.freightValueInCents;
  }
}
