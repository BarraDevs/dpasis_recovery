import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { TOKENS } from 'src/core/di/token';
import { ProductDto } from '../../dtos/product.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { FindAllProductQueryDto } from './dtos/find-all-product.dto';
import { FindAllProduct } from './find-all-product.service';

function makeValidFindAllProductInput(overrides: Partial<FindAllProductQueryDto> = {}): FindAllProductQueryDto {
  return { page: 1, size: 10, search: 'leitor', ...overrides };
}

describe('FindAllProduct - Unit tests', () => {
  let sut: FindAllProduct;
  let productDao: IProductDao;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        FindAllProduct,
        { provide: TOKENS.ProductDao, useValue: createMock<IProductDao>() },
      ],
    }).compile();

    sut = module.get(FindAllProduct);
    productDao = module.get(TOKENS.ProductDao);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should return the pagination dto', async() => {
    // Arrange
    const queries = makeValidFindAllProductInput();
    const row = createMock<ProductDto>({ id: 1 });
    jest.spyOn(productDao, 'findAll').mockResolvedValue([[row], 1]);

    // Act
    const result = await sut.execute(queries);

    // Assert
    expect(result).toEqual({
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1,
      data: [row],
    });
  });
});
