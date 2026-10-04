import { Injectable } from '@nestjs/common';
import { FindProductById } from 'src/app/product/application/usecases/find-product-by-id/find-product-by-id.service';
import { FindServiceCatalogById } from 'src/app/service/service-catalog/application/usecases/find-service-catalog-by-id/find-service-catalog-by-id.service';
import { OrderItemCreateProps } from 'src/app/order/domain/entities/order-item.entity';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { InactiveOrderReferenceError } from 'src/app/order/domain/errors/inactive-order-reference.error';
import { InvalidOrderItemError } from 'src/app/order/domain/errors/invalid-order-item.error';
import { CreateOrderItemInputDto } from './dtos/create-order.dto';

@Injectable()
export class ComposeOrderItems {
  constructor(
    private readonly findProductById: FindProductById,
    private readonly findServiceCatalogById: FindServiceCatalogById,
  ) {}

  public async execute(items: CreateOrderItemInputDto[]): Promise<OrderItemCreateProps[]> {
    const composed: OrderItemCreateProps[] = [];
    for (const item of items) {
      composed.push(await this.composeOne(item));
    }
    return composed;
  }

  private async composeOne(item: CreateOrderItemInputDto): Promise<OrderItemCreateProps> {
    const hasProduct = item.productId != null;
    const hasService = item.serviceId != null;
    if (hasProduct === hasService) {
      throw new InvalidOrderItemError();
    }

    if (item.type === ItemType.PRODUCT) {
      if (!hasProduct) throw new InvalidOrderItemError('Item de produto precisa de productId.');
      const product = await this.findProductById.execute(item.productId!);
      if (!product.active) throw new InactiveOrderReferenceError('produto');
      const overridden = item.unitValueInCents != null;
      return {
        type: ItemType.PRODUCT,
        productId: product.id,
        serviceId: null,
        code: product.code,
        description: product.description,
        serviceActivityCode: item.serviceActivityCode ?? null,
        quantity: item.quantity,
        unitValueInCents: overridden ? item.unitValueInCents! : product.unitPriceInCents,
        lastAdjustment: overridden ? new Date() : null,
      };
    }

    if (!hasService) throw new InvalidOrderItemError('Item de serviço precisa de serviceId.');
    const service = await this.findServiceCatalogById.execute(item.serviceId!);
    if (!service.active) throw new InactiveOrderReferenceError('serviço');
    const overridden = item.unitValueInCents != null;
    return {
      type: ItemType.SERVICE,
      productId: null,
      serviceId: service.id,
      code: service.name,
      description: service.description,
      serviceActivityCode: item.serviceActivityCode ?? null,
      quantity: item.quantity,
      unitValueInCents: overridden ? item.unitValueInCents! : service.unitPriceInCents,
      lastAdjustment: overridden ? new Date() : null,
    };
  }
}
