import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { ProductDto } from '../../dtos/product.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { UpdateProductStatus } from './update-product-status.service';

describe('UpdateProductStatus - Unit tests', () => {
  let sut: UpdateProductStatus;
  let productDao: IProductDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateProductStatus,
        { provide: TOKENS.ProductDao, useValue: createMock<IProductDao>() },
      ],
    }).compile();

    sut = module.get(UpdateProductStatus);
    productDao = module.get(TOKENS.ProductDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw ProductNotFoundError when the product does not exist', async() => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(null);
    const updateSpy = jest.spyOn(productDao, 'updateStatus');

    // Act & Assert
    await expect(sut.execute(1)).rejects.toThrow(ProductNotFoundError);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it.each([
    [true, false],
    [false, true],
  ])('should flip active from %s to %s', async(current, next) => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(createMock<ProductDto>({ id: 1, active: current }));
    const updateSpy = jest.spyOn(productDao, 'updateStatus').mockResolvedValue();

    // Act
    const result = await sut.execute(1);

    // Assert
    expect(updateSpy).toHaveBeenCalledWith(1, next);
    expect(result).toEqual({ message: 'Status do produto atualizado com sucesso' });
  });
});
