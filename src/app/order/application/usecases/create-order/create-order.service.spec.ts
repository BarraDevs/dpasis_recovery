import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ClientDto } from 'src/app/client/client/application/dtos/client.dto';
import { FindClientById } from 'src/app/client/client/application/usecases/find-client-by-id/find-client-by-id.service';
import { CompanyDto } from 'src/app/company/company/application/dtos/company.dto';
import { FindCompanyById } from 'src/app/company/company/application/usecases/find-company-by-id/find-company-by-id.service';
import { ProductDto } from 'src/app/product/application/dtos/product.dto';
import { FindProductById } from 'src/app/product/application/usecases/find-product-by-id/find-product-by-id.service';
import { FindSellerById } from 'src/app/seller/application/usecases/find-seller-by-id/find-seller-by-id.service';
import { FindServiceCatalogById } from 'src/app/service/service-catalog/application/usecases/find-service-catalog-by-id/find-service-catalog-by-id.service';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { InactiveOrderReferenceError } from 'src/app/order/domain/errors/inactive-order-reference.error';
import { TOKENS } from 'src/core/di/token';
import type { IOrderRepository } from '../../persistence/repository/order-repository.interface';
import { ComposeOrderItems } from './compose-order-items';
import { CreateOrder } from './create-order.service';
import { CreateOrderInputDto } from './dtos/create-order.dto';

function makeValidCreateOrderInput(overrides: Partial<CreateOrderInputDto> = {}): CreateOrderInputDto {
  return {
    clientId: 1,
    companyId: 2,
    items: [{ type: ItemType.PRODUCT, productId: 9, quantity: 2 }],
    ...overrides,
  };
}

describe('CreateOrder - Unit tests', () => {
  let sut: CreateOrder;
  let orderRepository: IOrderRepository;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        CreateOrder,
        ComposeOrderItems,
        { provide: FindClientById, useValue: createMock<FindClientById>() },
        { provide: FindCompanyById, useValue: createMock<FindCompanyById>() },
        { provide: FindSellerById, useValue: createMock<FindSellerById>() },
        { provide: FindProductById, useValue: createMock<FindProductById>() },
        { provide: FindServiceCatalogById, useValue: createMock<FindServiceCatalogById>() },
        { provide: TOKENS.OrderRepository, useValue: createMock<IOrderRepository>() },
      ],
    }).compile();

    sut = module.get(CreateOrder);
    orderRepository = module.get(TOKENS.OrderRepository);
    jest.spyOn(module.get(FindClientById), 'execute').mockResolvedValue(createMock<ClientDto>({ id: 1, active: true }));
    jest.spyOn(module.get(FindCompanyById), 'execute').mockResolvedValue(createMock<CompanyDto>({ id: 2, active: true }));
    jest.spyOn(module.get(FindProductById), 'execute').mockResolvedValue(createMock<ProductDto>({
      id: 9,
      code: 'PRD-9',
      description: 'Leitor',
      unitPriceInCents: 1000,
      active: true,
    }));
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should snapshot the catalog price and return the generated code', async() => {
    // Arrange
    const saveSpy = jest.spyOn(orderRepository, 'save').mockResolvedValue({ id: 4, code: 'ORC-2026-001' });

    // Act
    const result = await sut.execute(makeValidCreateOrderInput());

    // Assert
    expect(result).toEqual({ id: 4, code: 'ORC-2026-001' });
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
      props: expect.objectContaining({
        totalItemsInCents: 2000,
        totalValueInCents: 2000,
        items: [expect.objectContaining({ code: 'PRD-9', unitValueInCents: 1000, totalValueInCents: 2000 })],
      }),
    }));
  });

  it('should reject an inactive client', async() => {
    // Arrange
    const moduleClient = sut['findClientById'] as FindClientById;
    jest.spyOn(moduleClient, 'execute').mockResolvedValue(createMock<ClientDto>({ active: false }));

    // Act & Assert
    await expect(sut.execute(makeValidCreateOrderInput())).rejects.toThrow(InactiveOrderReferenceError);
  });
});
