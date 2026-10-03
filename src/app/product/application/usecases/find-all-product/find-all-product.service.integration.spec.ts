import { Test } from '@nestjs/testing';
import { ProductModule } from 'src/app/product/product.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { CreateProduct } from '../create-product/create-product.service';
import { FindAllProduct } from './find-all-product.service';

describe('FindAllProduct - Integration tests', () => {
  let sut: FindAllProduct;
  let createProduct: CreateProduct;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [ProductModule],
    }).compile();

    sut = module.get(FindAllProduct);
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

  it('should filter by search and active', async() => {
    // Arrange
    await createProduct.execute({
      code: 'PRD-ON',
      description: 'Leitor ativo',
      unitOfMeasure: 'UN',
      ncm: '11111111',
      unitCostInCents: 100,
      unitPriceInCents: 200,
      active: true,
    });
    await createProduct.execute({
      code: 'PRD-OFF',
      description: 'Leitor inativo',
      unitOfMeasure: 'UN',
      ncm: '22222222',
      unitCostInCents: 100,
      unitPriceInCents: 200,
      active: false,
    });

    // Act
    const result = await sut.execute({ search: 'leitor', active: true, page: 1, size: 10 });

    // Assert
    expect(result.totalItems).toBe(1);
    expect(result.data[0].code).toBe('PRD-ON');
  });
});
