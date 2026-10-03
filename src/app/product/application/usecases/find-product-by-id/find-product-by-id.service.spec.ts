import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { ProductDto } from '../../dtos/product.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { FindProductById } from './find-product-by-id.service';

describe('FindProductById - Unit tests', () => {
  let sut: FindProductById;
  let productDao: IProductDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        FindProductById,
        { provide: TOKENS.ProductDao, useValue: createMock<IProductDao>() },
      ],
    }).compile();

    sut = module.get(FindProductById);
    productDao = module.get(TOKENS.ProductDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw ProductNotFoundError when the product does not exist', async() => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(sut.execute(1)).rejects.toThrow(ProductNotFoundError);
    await expect(sut.execute(1)).rejects.toThrow('Produto não encontrado na base de dados.');
  });

  it('should return the product', async() => {
    // Arrange
    const product = createMock<ProductDto>({ id: 4, code: 'PRD-004' });
    jest.spyOn(productDao, 'findById').mockResolvedValue(product);

    // Act
    const result = await sut.execute(4);

    // Assert
    expect(result).toEqual(product);
  });
});
