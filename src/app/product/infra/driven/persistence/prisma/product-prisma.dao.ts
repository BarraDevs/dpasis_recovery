import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductDto } from 'src/app/product/application/dtos/product.dto';
import { IProductDao } from 'src/app/product/application/persistence/dao/product-dao.interface';
import { CreateProductInputDto } from 'src/app/product/application/usecases/create-product/dtos/create-product.dto';
import { EditProductInputDto } from 'src/app/product/application/usecases/edit-product/dtos/edit-product.dto';
import { FindAllProductQueryDto } from 'src/app/product/application/usecases/find-all-product/dtos/find-all-product.dto';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

const ProductSelect = {
  id: true,
  code: true,
  group1: true,
  group2: true,
  description: true,
  complement: true,
  manufacturerCode: true,
  unitOfMeasure: true,
  ncm: true,
  brand: true,
  economicLot: true,
  minStock: true,
  maxStock: true,
  warrantyDays: true,
  weightInGrams: true,
  heightInCm: true,
  lengthInCm: true,
  widthInCm: true,
  markup: true,
  marginB: true,
  currency: true,
  quotation: true,
  unitCostInCents: true,
  unitPriceInCents: true,
  ean: true,
  additionalInfo: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

@Injectable()
export class ProductDaoAdapterPrisma implements IProductDao {
  constructor(private readonly prisma: PrismaService) {}

  public async findAll(queries: FindAllProductQueryDto): Promise<[ProductDto[], number]> {
    const pagination = this.prisma.paginationFactory(queries.page, queries.size);
    const conditions: Prisma.ProductWhereInput[] = [];

    if (queries.search?.trim()) {
      const search = queries.search.trim();
      conditions.push({
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { manufacturerCode: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { ean: { contains: search, mode: 'insensitive' } },
          { ncm: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (typeof queries.active === 'boolean') {
      conditions.push({ active: queries.active });
    }

    const where: Prisma.ProductWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        select: ProductSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return [products, total];
  }

  public async findById(id: number): Promise<ProductDto | null> {
    return this.prisma.product.findUnique({
      where: { id },
      select: ProductSelect,
    });
  }

  public async findByCode(code: string): Promise<ProductDto | null> {
    return this.prisma.product.findUnique({
      where: { code },
      select: ProductSelect,
    });
  }

  public async save(data: CreateProductInputDto): Promise<number> {
    const result = await this.prisma.product.create({ data });
    return result.id;
  }

  public async edit(id: number, data: EditProductInputDto): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data,
    });
  }

  public async delete(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  public async updateStatus(id: number, active: boolean): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { active },
    });
  }
}
