import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { pipeOptions } from 'src/infra/validators/class/config';
import { ForgotPasswordInputDto } from './forgot-password.dto';

const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: ForgotPasswordInputDto,
};

describe('ForgotPasswordInputDto', () => {
  let target: ValidationPipe;

  beforeEach(() => {
    target = new ValidationPipe(pipeOptions);
  });

  describe.each(
    [
      'email',
    ]
  )('%s field', (field: string) => {
    it.each(
      [
        undefined,
        null,
        '',
        '  ',
      ]
    )(`should throw an error if ${field} is empty (%s)`, async(value: any) => {
      const data = { [field]: value };

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} é obrigatório`);
      });
    });

    it.each(
      [
        123,
        true,
        false,
        {},
        [],
      ]
    )(`should throw an error if ${field} is not a string (%s)`, async(value: any) => {
      const data = { [field]: value };

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ser uma string`);
      });
    });

    it.each(
      [
        'not-an-email',
        'missing-at.com',
        'missing-domain@',
      ]
    )(`should throw an error if ${field} is not a valid email (%s)`, async(value: string) => {
      const data = { [field]: value };

      expect.assertions(1);
      return target.transform(data, metadata).catch((error) => {
        expect(error.getResponse().message).toContain(`${field} deve ser um e-mail válido`);
      });
    });
  });

  it('should trim the email', async() => {
    const data = { email: '  admin@email.com  ' };

    const result = await target.transform(data, metadata);

    expect(result.email).toBe('admin@email.com');
  });

  it('should pass if all fields are valid', async() => {
    const data = {
      email: 'admin@email.com',
    };

    const result = await target.transform(data, metadata);

    expect(result).toBeInstanceOf(ForgotPasswordInputDto);
    expect(result).toEqual(data);
  });
});
