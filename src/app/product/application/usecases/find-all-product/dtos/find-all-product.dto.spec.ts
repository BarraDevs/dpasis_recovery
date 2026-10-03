import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { pipeOptions } from 'src/infra/validators/class/config';
import { FindAllProductQueryDto } from './find-all-product.dto';

const metadata: ArgumentMetadata = {
  type: 'query',
  metatype: FindAllProductQueryDto,
};

function makeValidInputDto(overrides: Partial<FindAllProductQueryDto> = {}): FindAllProductQueryDto {
  return { ...overrides };
}

describe('FindAllProductQueryDto', () => {
  let target: ValidationPipe;

  beforeEach(() => {
    target = new ValidationPipe(pipeOptions);
  });

  it('should accept an empty query', async() => {
    const result = await target.transform(makeValidInputDto(), metadata);

    expect(result).toBeInstanceOf(FindAllProductQueryDto);
  });

  it('should trim search', async() => {
    const result = await target.transform(makeValidInputDto({ search: '  leitor  ' }), metadata);

    expect(result.search).toBe('leitor');
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('should coerce active %s', async(value, expected) => {
    const result = await target.transform(makeValidInputDto({ active: value as any }), metadata);

    expect(result.active).toBe(expected);
  });

  it('should reject an invalid active value', async() => {
    const data = makeValidInputDto({ active: 'sim' as any });

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('active deve ser um booleano');
    });
  });
});
