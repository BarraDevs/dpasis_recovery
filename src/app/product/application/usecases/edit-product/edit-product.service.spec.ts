import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ProductAlreadyExistsError } from 'src/app/product/domain/errors/product-already-exists.error';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { ProductDto } from '../../dtos/product.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { EditProductInputDto } from './dtos/edit-product.dto';
import { EditProduct } from './edit-product.service';

function makeValidEditProductInput(overrides: Partial<EditProductInputDto> = {}): EditProductInputDto {
  return { description: 'Nova descrição', ...overrides };
}

describe('EditProduct - Unit tests', () => {
  let sut: EditProduct;
  let productDao: IProductDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        EditProduct,
        { provide: TOKENS.ProductDao, useValue: createMock<IProductDao>() },
      ],
    }).compile();

    sut = module.get(EditProduct);
    productDao = module.get(TOKENS.ProductDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw ProductNotFoundError when the product does not exist', async() => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(sut.execute(1, makeValidEditProductInput())).rejects.toThrow(ProductNotFoundError);
    await expect(sut.execute(1, makeValidEditProductInput())).rejects.toThrow('Produto não encontrado na base de dados.');
  });

  it('should throw ProductAlreadyExistsError when the new code belongs to another product', async() => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(createMock<ProductDto>({ id: 1, code: 'PRD-001' }));
    jest.spyOn(productDao, 'findByCode').mockResolvedValue(createMock<ProductDto>({ id: 2, code: 'PRD-002' }));
    const editSpy = jest.spyOn(productDao, 'edit');

    // Act & Assert
    await expect(sut.execute(1, makeValidEditProductInput({ code: 'PRD-002' }))).rejects.toThrow(ProductAlreadyExistsError);
    expect(editSpy).not.toHaveBeenCalled();
  });

  it('should keep the same code without looking up another product', async() => {
    // Arrange
    jest.spyOn(productDao, 'findById').mockResolvedValue(createMock<ProductDto>({ id: 1, code: 'PRD-001' }));
    const findByCodeSpy = jest.spyOn(productDao, 'findByCode');
    const editSpy = jest.spyOn(productDao, 'edit').mockResolvedValue();
    const input = makeValidEditProductInput({ code: 'PRD-001' });

    // Act
    const result = await sut.execute(1, input);

    // Assert
    expect(findByCodeSpy).not.toHaveBeenCalled();
    expect(editSpy).toHaveBeenCalledWith(1, input);
    expect(result).toEqual({ message: 'Produto atualizado com sucesso' });
  });
});
