import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { pipeOptions } from 'src/infra/validators/class/config';
import { CreateOrderInputDto } from './create-order.dto';

const metadata: ArgumentMetadata = { type: 'body', metatype: CreateOrderInputDto };

function makeValidInputDto(overrides: Partial<CreateOrderInputDto> = {}): CreateOrderInputDto {
  return {
    clientId: 1,
    companyId: 2,
    items: [{ type: ItemType.PRODUCT, productId: 3, quantity: 1 }],
    ...overrides,
  };
}

describe('CreateOrderInputDto', () => {
  let target: ValidationPipe;

  beforeEach(() => {
    target = new ValidationPipe(pipeOptions);
  });

  it('should accept a product item', async() => {
    const result = await target.transform(makeValidInputDto(), metadata);
    expect(result).toBeInstanceOf(CreateOrderInputDto);
    expect(result.items[0].quantity).toBe(1);
  });

  it('should reject a non-positive quantity', async() => {
    const data = makeValidInputDto({ items: [{ type: ItemType.PRODUCT, productId: 3, quantity: 0 }] });

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('items.0.quantity deve ser um número positivo');
    });
  });

  it('should reject an unknown item type', async() => {
    const data = makeValidInputDto({ items: [{ type: 'KIT' as ItemType, quantity: 1 }] });

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('items.0.type deve ser PRODUCT ou SERVICE');
    });
  });
});
