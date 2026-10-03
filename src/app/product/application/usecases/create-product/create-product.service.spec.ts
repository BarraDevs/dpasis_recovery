import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ProductAlreadyExistsError } from 'src/app/product/domain/errors/product-already-exists.error';
import { TOKENS } from 'src/core/di/token';
import { ProductDto } from '../../dtos/product.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { CreateProduct } from './create-product.service';
import { CreateProductInputDto } from './dtos/create-product.dto';

function makeValidCreateProductInput(overrides: Partial<CreateProductInputDto> = {}): CreateProductInputDto {
  return {
    code: 'PRD-001',
    description: 'Leitor de código de barras',
    unitOfMeasure: 'UN',
    ncm: '84716053',
    unitCostInCents: 1500,
    unitPriceInCents: 2990,
    ...overrides,
  };
}

describe('CreateProduct - Unit tests', () => {
  let sut: CreateProduct;
  let productDao: IProductDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        CreateProduct,
        { provide: TOKENS.ProductDao, useValue: createMock<IProductDao>() },
      ],
    }).compile();

    sut = module.get(CreateProduct);
    productDao = module.get(TOKENS.ProductDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should throw ProductAlreadyExistsError when the code is taken', async() => {
    // Arrange
    const input = makeValidCreateProductInput();
    jest.spyOn(productDao, 'findByCode').mockResolvedValue(createMock<ProductDto>({ code: input.code }));
    const saveSpy = jest.spyOn(productDao, 'save');

    // Act & Assert
    await expect(sut.execute(input)).rejects.toThrow(ProductAlreadyExistsError);
    await expect(sut.execute(input)).rejects.toThrow('O código PRD-001 já está em uso.');
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should save and return the id when the code is free', async() => {
    // Arrange
    const input = makeValidCreateProductInput();
    jest.spyOn(productDao, 'findByCode').mockResolvedValue(null);
    const saveSpy = jest.spyOn(productDao, 'save').mockResolvedValue(7);

    // Act
    const result = await sut.execute(input);

    // Assert
    expect(saveSpy).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 7 });
  });
});
