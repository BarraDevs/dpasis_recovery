import { Test } from '@nestjs/testing';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { ProductModule } from 'src/app/product/product.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { CreateProduct } from '../create-product/create-product.service';
import { FindProductById } from './find-product-by-id.service';

describe('FindProductById - Integration tests', () => {
  let sut: FindProductById;
  let createProduct: CreateProduct;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [ProductModule],
    }).compile();

    sut = module.get(FindProductById);
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

  it('should return the persisted product', async() => {
    // Arrange
    const { id } = await createProduct.execute({
      code: 'PRD-GET',
      description: 'Leitor',
      unitOfMeasure: 'UN',
      ncm: '84716053',
      unitCostInCents: 100,
      unitPriceInCents: 200,
    });

    // Act
    const result = await sut.execute(id);

    // Assert
    expect(result.id).toBe(id);
    expect(result.code).toBe('PRD-GET');
  });

  it('should throw ProductNotFoundError when the product does not exist', async() => {
    await expect(sut.execute(999999)).rejects.toThrow(ProductNotFoundError);
  });
});
