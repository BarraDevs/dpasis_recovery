import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IOrderRepository } from 'src/app/order/application/persistence/repository/order-repository.interface';
import { Order, OrderProps } from 'src/app/order/domain/entities/order.entity';
import { OrderStatus } from 'src/app/order/domain/enums/order-status.enum';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { OrderFactory } from 'src/app/order/domain/factories/order.factory';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class OrderRepositoryAdapterPrisma implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(entity: Order): Promise<{ id: number; code: string }> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await this.insert(entity);
      } catch (error) {
        const duplicated = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!duplicated || attempt === 1) throw error;
      }
    }
    throw new Error('Falha ao gerar o código do orçamento.');
  }

  public async edit(entity: Order): Promise<void> {
    const props = entity.props;
    await this.prisma.$transaction(async(tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: props.id } });
      await tx.order.update({
        where: { id: props.id },
        data: {
          ...this.header(props),
          items: { create: props.items.map((item) => this.itemData(item)) },
        },
      });
    });
  }

  public async findById(id: number): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!data) return null;

    return OrderFactory.load({
      id: data.id,
      code: data.code,
      clientId: data.clientId,
      companyId: data.companyId,
      sellerId: data.sellerId,
      freightMode: data.freightMode,
      carrierName: data.carrierName,
      freightValueInCents: data.freightValueInCents,
      commercialProcess: data.commercialProcess,
      observation: data.observation,
      commercialNote: data.commercialNote,
      status: data.status as OrderStatus,
      totalItemsInCents: data.totalItemsInCents,
      totalValueInCents: data.totalValueInCents,
      active: data.active,
      items: data.items.map((item) => ({
        id: item.id,
        type: item.type as ItemType,
        productId: item.productId,
        serviceId: item.serviceId,
        code: item.code,
        description: item.description,
        serviceActivityCode: item.serviceActivityCode,
        quantity: item.quantity,
        unitValueInCents: item.unitValueInCents,
        totalValueInCents: item.totalValueInCents,
        lastAdjustment: item.lastAdjustment,
      })),
    });
  }

  public async delete(id: number): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }

  private async insert(entity: Order): Promise<{ id: number; code: string }> {
    const props = entity.props;
    return this.prisma.$transaction(async(tx) => {
      const code = await this.nextCode(tx);
      const created = await tx.order.create({
        data: {
          ...this.header(props),
          code,
          items: { create: props.items.map((item) => this.itemData(item)) },
        },
      });
      return { id: created.id, code };
    });
  }

  private header(props: OrderProps): Omit<Prisma.OrderUncheckedCreateWithoutItemsInput, 'code'> {
    return {
      clientId: props.clientId,
      companyId: props.companyId,
      sellerId: props.sellerId,
      freightMode: props.freightMode,
      carrierName: props.carrierName,
      freightValueInCents: props.freightValueInCents,
      commercialProcess: props.commercialProcess,
      observation: props.observation,
      commercialNote: props.commercialNote,
      status: props.status,
      totalItemsInCents: props.totalItemsInCents,
      totalValueInCents: props.totalValueInCents,
      active: props.active,
    };
  }

  private itemData(item: OrderProps['items'][number]): Prisma.OrderItemUncheckedCreateWithoutOrderInput {
    return {
      type: item.type,
      productId: item.productId,
      serviceId: item.serviceId,
      code: item.code,
      description: item.description,
      serviceActivityCode: item.serviceActivityCode,
      quantity: item.quantity,
      unitValueInCents: item.unitValueInCents,
      totalValueInCents: item.totalValueInCents,
      lastAdjustment: item.lastAdjustment,
    };
  }

  private async nextCode(tx: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORC-${year}-`;
    const latest = await tx.order.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { id: 'desc' },
      select: { code: true },
    });
    const current = latest ? Number(latest.code.slice(prefix.length)) : 0;
    const sequence = Number.isFinite(current) ? current + 1 : 1;
    return `${prefix}${String(sequence).padStart(3, '0')}`;
  }
}
