import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { ProductDto } from '../../dtos/product.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { DeleteProduct } from './delete-product.service';

describe('DeleteProduct - Unit tests', () => {
  let sut: DeleteProduct;
  let productDao: IProductDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        DeleteProduct,
        { provide: TOKENS.ProductDao, useValue: createMock<IProductDao>() },
      ],
    }).compile();

    sut = module.get(DeleteProduct);
    productDao = module.get(TOKENS.ProductDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw ProductNotFoundError when the product does not exist', async() => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(null);
    const deleteSpy = jest.spyOn(productDao, 'delete');

    // Act & Assert
    await expect(sut.execute(1)).rejects.toThrow(ProductNotFoundError);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('should delete the product', async() => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(createMock<ProductDto>({ id: 1 }));
    const deleteSpy = jest.spyOn(productDao, 'delete').mockResolvedValue();

    // Act
    const result = await sut.execute(1);

    // Assert
    expect(deleteSpy).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: 'Produto excluído com sucesso' });
  });
});
