import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { pipeOptions } from 'src/infra/validators/class/config';
import { EditProductInputDto } from './edit-product.dto';

const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: EditProductInputDto,
};

function makeValidInputDto(overrides: Partial<EditProductInputDto> = {}): EditProductInputDto {
  return { ...overrides };
}

describe('EditProductInputDto', () => {
  let target: ValidationPipe;

  beforeEach(() => {
    target = new ValidationPipe(pipeOptions);
  });

  it('should accept an empty body', async() => {
    const result = await target.transform(makeValidInputDto(), metadata);

    expect(result).toBeInstanceOf(EditProductInputDto);
    expect(result.code).toBeUndefined();
  });

  it('should trim code', async() => {
    const result = await target.transform(makeValidInputDto({ code: '  PRD-9  ' }), metadata);

    expect(result.code).toBe('PRD-9');
  });

  it('should reject code above 64 characters', async() => {
    const data = makeValidInputDto({ code: 'a'.repeat(65) });

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('code deve ter no máximo 64 caracteres');
    });
  });

  it('should reject a negative price', async() => {
    const data = makeValidInputDto({ unitPriceInCents: -1 });

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('unitPriceInCents deve ser maior ou igual a 0');
    });
  });

  it('should accept active false', async() => {
    const result = await target.transform(makeValidInputDto({ active: false }), metadata);

    expect(result.active).toBe(false);
  });
});
