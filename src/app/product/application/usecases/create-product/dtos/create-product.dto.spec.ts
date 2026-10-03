import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { pipeOptions } from 'src/infra/validators/class/config';
import { CreateProductInputDto } from './create-product.dto';

const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: CreateProductInputDto,
};

function makeValidInputDto(overrides: Partial<CreateProductInputDto> = {}): CreateProductInputDto {
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

const requiredStrings = [
  { field: 'code', max: 64 },
  { field: 'description', max: 512 },
  { field: 'unitOfMeasure', max: 16 },
  { field: 'ncm', max: 8 },
] as const;

const optionalStrings = [
  { field: 'group1', max: 128 },
  { field: 'group2', max: 128 },
  { field: 'complement', max: 512 },
  { field: 'manufacturerCode', max: 64 },
  { field: 'brand', max: 128 },
  { field: 'currency', max: 3 },
  { field: 'ean', max: 14 },
  { field: 'additionalInfo', max: 8192 },
] as const;

const optionalNumbers = [
  'economicLot',
  'minStock',
  'maxStock',
  'weightInGrams',
  'heightInCm',
  'lengthInCm',
  'widthInCm',
  'markup',
  'marginB',
  'quotation',
] as const;

describe('CreateProductInputDto', () => {
  let target: ValidationPipe;

  beforeEach(() => {
    target = new ValidationPipe(pipeOptions);
  });

  it('should accept the required payload', async() => {
    const data = makeValidInputDto();

    const result = await target.transform(data, metadata);

    expect(result).toBeInstanceOf(CreateProductInputDto);
    expect(result.code).toBe('PRD-001');
    expect(result.unitCostInCents).toBe(1500);
    expect(result.unitPriceInCents).toBe(2990);
  });

  describe.each(requiredStrings)('$field', ({ field, max }) => {
    it.each([undefined, null, '', '   '])('should reject empty (%s)', async(value: any) => {
      const data = makeValidInputDto({ [field]: value });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} é obrigatório`);
      });
    });

    it.each([123, true, {}, []])('should reject non-string (%s)', async(value: any) => {
      const data = makeValidInputDto({ [field]: value });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ser uma string`);
      });
    });

    it('should reject above max length', async() => {
      const data = makeValidInputDto({ [field]: 'a'.repeat(max + 1) });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ter no máximo ${max} caracteres`);
      });
    });

    it('should accept the max length and trim', async() => {
      const value = 'a'.repeat(max);
      const data = makeValidInputDto({ [field]: `  ${value}  ` });

      const result = await target.transform(data, metadata);

      expect(result[field]).toBe(value);
    });
  });

  describe.each(optionalStrings)('$field', ({ field, max }) => {
    it('should accept omission', async() => {
      const result = await target.transform(makeValidInputDto(), metadata);

      expect(result[field]).toBeUndefined();
    });

    it.each(['', '   '])('should reject blank (%s)', async(value: string) => {
      const data = makeValidInputDto({ [field]: value });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} não pode ser vazio`);
      });
    });

    it('should reject above max length', async() => {
      const data = makeValidInputDto({ [field]: 'a'.repeat(max + 1) });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ter no máximo ${max} caracteres`);
      });
    });

    it('should trim a valid value', async() => {
      const data = makeValidInputDto({ [field]: '  ok  ' });

      const result = await target.transform(data, metadata);

      expect(result[field]).toBe('ok');
    });
  });

  describe.each(['unitCostInCents', 'unitPriceInCents'] as const)('%s', (field) => {
    it.each([undefined, null, ''])('should reject empty (%s)', async(value: any) => {
      const data = makeValidInputDto({ [field]: value });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} é obrigatório`);
      });
    });

    it.each(['10', 1.5, true])('should reject non-integer (%s)', async(value: any) => {
      const data = makeValidInputDto({ [field]: value });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ser um número inteiro`);
      });
    });

    it('should reject a negative value', async() => {
      const data = makeValidInputDto({ [field]: -1 });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ser maior ou igual a 0`);
      });
    });

    it('should accept zero', async() => {
      const result = await target.transform(makeValidInputDto({ [field]: 0 }), metadata);

      expect(result[field]).toBe(0);
    });
  });

  describe.each(optionalNumbers)('%s', (field) => {
    it('should accept omission', async() => {
      const result = await target.transform(makeValidInputDto(), metadata);

      expect(result[field]).toBeUndefined();
    });

    it('should reject a negative value', async() => {
      const data = makeValidInputDto({ [field]: -0.1 });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ser maior ou igual a 0`);
      });
    });

    it('should accept zero', async() => {
      const result = await target.transform(makeValidInputDto({ [field]: 0 }), metadata);

      expect(result[field]).toBe(0);
    });
  });

  describe('warrantyDays', () => {
    it('should reject a fractional value', async() => {
      const data = makeValidInputDto({ warrantyDays: 1.5 });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain('warrantyDays deve ser um número inteiro');
      });
    });

    it('should accept zero', async() => {
      const result = await target.transform(makeValidInputDto({ warrantyDays: 0 }), metadata);

      expect(result.warrantyDays).toBe(0);
    });
  });

  describe('active', () => {
    it('should accept false', async() => {
      const result = await target.transform(makeValidInputDto({ active: false }), metadata);

      expect(result.active).toBe(false);
    });

    it('should reject a string', async() => {
      const data = makeValidInputDto({ active: 'true' as any });

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain('active deve ser um booleano');
      });
    });
  });
});
