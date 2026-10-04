import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderDto } from 'src/app/order/application/dtos/order.dto';
import { IOrderDao } from 'src/app/order/application/persistence/dao/order-dao.interface';
import { FindAllOrderQueryDto } from 'src/app/order/application/usecases/find-all-order/dtos/find-all-order.dto';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

const OrderItemSelect = {
  id: true,
  type: true,
  productId: true,
  serviceId: true,
  code: true,
  description: true,
  serviceActivityCode: true,
  quantity: true,
  unitValueInCents: true,
  totalValueInCents: true,
  lastAdjustment: true,
} satisfies Prisma.OrderItemSelect;

const OrderSelect = {
  id: true,
  code: true,
  clientId: true,
  companyId: true,
  sellerId: true,
  freightMode: true,
  carrierName: true,
  freightValueInCents: true,
  commercialProcess: true,
  observation: true,
  commercialNote: true,
  status: true,
  totalItemsInCents: true,
  totalValueInCents: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  items: { select: OrderItemSelect },
} satisfies Prisma.OrderSelect;

@Injectable()
export class OrderDaoAdapterPrisma implements IOrderDao {
  constructor(private readonly prisma: PrismaService) {}

  public async findAll(queries: FindAllOrderQueryDto): Promise<[OrderDto[], number]> {
    const pagination = this.prisma.paginationFactory(queries.page, queries.size);
    const conditions: Prisma.OrderWhereInput[] = [];

    if (queries.search?.trim()) {
      conditions.push({ code: { contains: queries.search.trim(), mode: 'insensitive' } });
    }
    if (queries.clientId != null) conditions.push({ clientId: queries.clientId });
    if (queries.companyId != null) conditions.push({ companyId: queries.companyId });
    if (queries.sellerId != null) conditions.push({ sellerId: queries.sellerId });
    if (queries.status) conditions.push({ status: queries.status });
    if (typeof queries.active === 'boolean') conditions.push({ active: queries.active });

    const where: Prisma.OrderWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        select: OrderSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return [orders, total];
  }

  public async findById(id: number): Promise<OrderDto | null> {
    return this.prisma.order.findUnique({
      where: { id },
      select: OrderSelect,
    });
  }
}
