import { Test } from '@nestjs/testing';
import { ProductAlreadyExistsError } from 'src/app/product/domain/errors/product-already-exists.error';
import { ProductModule } from 'src/app/product/product.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { CreateProduct } from './create-product.service';
import { CreateProductInputDto } from './dtos/create-product.dto';

function makeValidCreateProductInput(overrides: Partial<CreateProductInputDto> = {}): CreateProductInputDto {
  return {
    code: `PRD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: 'Leitor de código de barras',
    unitOfMeasure: 'UN',
    ncm: '84716053',
    unitCostInCents: 1500,
    unitPriceInCents: 2990,
    ...overrides,
  };
}

describe('CreateProduct - Integration tests', () => {
  let sut: CreateProduct;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [ProductModule],
    }).compile();

    sut = module.get(CreateProduct);
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

  it('should persist the product and apply schema defaults', async() => {
    // Arrange
    const input = makeValidCreateProductInput({ brand: 'Acme' });

    // Act
    const result = await sut.execute(input);

    // Assert
    const saved = await prisma.product.findUnique({ where: { id: result.id } });
    expect(saved).toEqual(expect.objectContaining({
      code: input.code,
      description: input.description,
      brand: 'Acme',
      unitCostInCents: 1500,
      unitPriceInCents: 2990,
      currency: 'BRL',
      minStock: 0,
      active: true,
    }));
  });

  it('should reject a duplicated code', async() => {
    // Arrange
    const input = makeValidCreateProductInput({ code: 'PRD-DUP' });
    await sut.execute(input);

    // Act & Assert
    await expect(sut.execute(input)).rejects.toThrow(ProductAlreadyExistsError);
    await expect(sut.execute({ ...input, description: 'Outro' })).rejects.toThrow('O código PRD-DUP já está em uso.');
  });
});
