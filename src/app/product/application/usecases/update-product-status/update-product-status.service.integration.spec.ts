import { Test } from '@nestjs/testing';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { ProductModule } from 'src/app/product/product.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { CreateProduct } from '../create-product/create-product.service';
import { UpdateProductStatus } from './update-product-status.service';

describe('UpdateProductStatus - Integration tests', () => {
  let sut: UpdateProductStatus;
  let createProduct: CreateProduct;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [ProductModule],
    }).compile();

    sut = module.get(UpdateProductStatus);
    createProduct = module.get(CreateProduct);
    prisma = module.get(PrismaService);
  });

  beforeEach(async() => {
    await prisma.truncate();
  });

  afterAll(async() => {
    await prisma.truncate();
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should flip active and flip it back', async() => {
    // Arrange
    const { id } = await createProduct.execute({
      code: 'PRD-STATUS',
      description: 'Leitor',
      unitOfMeasure: 'UN',
      ncm: '84716053',
      unitCostInCents: 100,
      unitPriceInCents: 200,
      active: true,
    });

    // Act
    await sut.execute(id);
    const afterFirst = await prisma.product.findUnique({ where: { id } });
    await sut.execute(id);
    const afterSecond = await prisma.product.findUnique({ where: { id } });

    // Assert
    expect(afterFirst?.active).toBe(false);
    expect(afterSecond?.active).toBe(true);
  });

  it('should throw ProductNotFoundError when the product does not exist', async() => {
    await expect(sut.execute(999999)).rejects.toThrow(ProductNotFoundError);
  });
});
