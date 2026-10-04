import { Inject, Injectable } from '@nestjs/common';
import { FindClientById } from 'src/app/client/client/application/usecases/find-client-by-id/find-client-by-id.service';
import { FindCompanyById } from 'src/app/company/company/application/usecases/find-company-by-id/find-company-by-id.service';
import { FindSellerById } from 'src/app/seller/application/usecases/find-seller-by-id/find-seller-by-id.service';
import { OrderItem } from 'src/app/order/domain/entities/order-item.entity';
import { InactiveOrderReferenceError } from 'src/app/order/domain/errors/inactive-order-reference.error';
import { OrderNotFoundError } from 'src/app/order/domain/errors/order-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import type { IOrderRepository } from '../../persistence/repository/order-repository.interface';
import { ComposeOrderItems } from '../create-order/compose-order-items';
import { EditOrderInputDto } from './dtos/edit-order.dto';

@Injectable()
export class EditOrder {
  constructor(
    private readonly findClientById: FindClientById,
    private readonly findCompanyById: FindCompanyById,
    private readonly findSellerById: FindSellerById,
    private readonly composeOrderItems: ComposeOrderItems,
    @Inject(TOKENS.OrderRepository) private readonly orderRepository: IOrderRepository,
  ) {}

  public async execute(id: number, data: EditOrderInputDto): Promise<SuccessMessage> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new OrderNotFoundError();

    if (data.clientId !== undefined || data.companyId !== undefined || data.sellerId !== undefined) {
      if (data.clientId !== undefined) {
        const client = await this.findClientById.execute(data.clientId);
        if (!client.active) throw new InactiveOrderReferenceError('cliente');
      }
      if (data.companyId !== undefined) {
        const company = await this.findCompanyById.execute(data.companyId);
        if (!company.active) throw new InactiveOrderReferenceError('empresa');
      }
      if (data.sellerId != null) {
        const seller = await this.findSellerById.execute(data.sellerId);
        if (!seller.active) throw new InactiveOrderReferenceError('vendedor');
      }
      order.updateReferences({
        clientId: data.clientId,
        companyId: data.companyId,
        sellerId: data.sellerId,
      });
    }

    if (data.items !== undefined) {
      const items = await this.composeOrderItems.execute(data.items);
      order.replaceItems(items.map((item) => OrderItem.create(item)));
    }

    const hasCommercialChange = [
      data.freightMode,
      data.carrierName,
      data.freightValueInCents,
      data.commercialProcess,
      data.observation,
      data.commercialNote,
    ].some((value) => value !== undefined);
    if (hasCommercialChange) {
      order.updateCommercial({
        freightMode: data.freightMode,
        carrierName: data.carrierName,
        freightValueInCents: data.freightValueInCents,
        commercialProcess: data.commercialProcess,
        observation: data.observation,
        commercialNote: data.commercialNote,
      });
    }

    await this.orderRepository.edit(order);
    return { message: 'Orçamento atualizado com sucesso' };
  }
}
