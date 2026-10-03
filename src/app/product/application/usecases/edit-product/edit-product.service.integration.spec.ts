import { Test } from '@nestjs/testing';
import { ProductAlreadyExistsError } from 'src/app/product/domain/errors/product-already-exists.error';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { ProductModule } from 'src/app/product/product.module';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { CreateProduct } from '../create-product/create-product.service';
import { CreateProductInputDto } from '../create-product/dtos/create-product.dto';
import { EditProduct } from './edit-product.service';

function makeValidCreateProductInput(code: string): CreateProductInputDto {
  return {
    code,
    description: 'Leitor de código de barras',
    unitOfMeasure: 'UN',
    ncm: '84716053',
    unitCostInCents: 1500,
    unitPriceInCents: 2990,
  };
}

describe('EditProduct - Integration tests', () => {
  let sut: EditProduct;
  let createProduct: CreateProduct;
  let prisma: PrismaService;

  beforeAll(async() => {
    const module = await Test.createTestingModule({
      imports: [ProductModule],
    }).compile();

    sut = module.get(EditProduct);
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

  it('should update the description', async() => {
    // Arrange
    const { id } = await createProduct.execute(makeValidCreateProductInput('PRD-EDIT'));

    // Act
    const result = await sut.execute(id, { description: 'Descrição nova' });

    // Assert
    const saved = await prisma.product.findUnique({ where: { id } });
    expect(result).toEqual({ message: 'Produto atualizado com sucesso' });
    expect(saved?.description).toBe('Descrição nova');
    expect(saved?.code).toBe('PRD-EDIT');
  });

  it('should reject a code that belongs to another product', async() => {
    // Arrange
    const first = await createProduct.execute(makeValidCreateProductInput('PRD-A'));
    await createProduct.execute(makeValidCreateProductInput('PRD-B'));

    // Act & Assert
    await expect(sut.execute(first.id, { code: 'PRD-B' })).rejects.toThrow(ProductAlreadyExistsError);
  });

  it('should throw ProductNotFoundError when the product does not exist', async() => {
    await expect(sut.execute(999999, { description: 'x' })).rejects.toThrow(ProductNotFoundError);
  });
});
