import { Inject, Injectable } from '@nestjs/common';
import { FindClientById } from 'src/app/client/client/application/usecases/find-client-by-id/find-client-by-id.service';
import { FindCompanyById } from 'src/app/company/company/application/usecases/find-company-by-id/find-company-by-id.service';
import { FindSellerById } from 'src/app/seller/application/usecases/find-seller-by-id/find-seller-by-id.service';
import { InactiveOrderReferenceError } from 'src/app/order/domain/errors/inactive-order-reference.error';
import { OrderFactory } from 'src/app/order/domain/factories/order.factory';
import { TOKENS } from 'src/core/di/token';
import type { IOrderRepository } from '../../persistence/repository/order-repository.interface';
import { ComposeOrderItems } from './compose-order-items';
import { CreateOrderInputDto, CreateOrderOutputDto } from './dtos/create-order.dto';

@Injectable()
export class CreateOrder {
  constructor(
    private readonly findClientById: FindClientById,
    private readonly findCompanyById: FindCompanyById,
    private readonly findSellerById: FindSellerById,
    private readonly composeOrderItems: ComposeOrderItems,
    @Inject(TOKENS.OrderRepository) private readonly orderRepository: IOrderRepository,
  ) {}

  public async execute(data: CreateOrderInputDto): Promise<CreateOrderOutputDto> {
    const client = await this.findClientById.execute(data.clientId);
    if (!client.active) throw new InactiveOrderReferenceError('cliente');

    const company = await this.findCompanyById.execute(data.companyId);
    if (!company.active) throw new InactiveOrderReferenceError('empresa');

    if (data.sellerId != null) {
      const seller = await this.findSellerById.execute(data.sellerId);
      if (!seller.active) throw new InactiveOrderReferenceError('vendedor');
    }

    const items = await this.composeOrderItems.execute(data.items ?? []);
    const entity = OrderFactory.create({
      clientId: data.clientId,
      companyId: data.companyId,
      sellerId: data.sellerId ?? null,
      freightMode: data.freightMode ?? null,
      carrierName: data.carrierName ?? null,
      freightValueInCents: data.freightValueInCents ?? 0,
      commercialProcess: data.commercialProcess ?? null,
      observation: data.observation ?? null,
      commercialNote: data.commercialNote ?? null,
      items,
    });

    return this.orderRepository.save(entity);
  }
}
