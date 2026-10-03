import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { pipeOptions } from 'src/infra/validators/class/config';
import { ResetPasswordInputDto } from './reset-password.dto';

const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: ResetPasswordInputDto,
};

describe('ResetPasswordInputDto', () => {
  let target: ValidationPipe;

  beforeEach(() => {
    target = new ValidationPipe(pipeOptions);
  });

  describe.each(
    [
      'email',
      'token',
      'password',
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
  });

  it.each(
    [
      'not-an-email',
      'missing-at.com',
      'missing-domain@',
    ]
  )('should throw an error if email is not a valid email (%s)', async(value: string) => {
    const data = { email: value, token: 'token', password: '123456' };

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('email deve ser um e-mail válido');
    });
  });

  it('should throw an error if token is longer than 64 characters', async() => {
    const data = { email: 'admin@email.com', token: 'a'.repeat(65), password: '123456' };

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('token deve ter no máximo 64 caracteres');
    });
  });

  it('should throw an error if password is shorter than 6 characters', async() => {
    const data = { email: 'admin@email.com', token: 'token', password: '12345' };

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('password deve ter no mínimo 6 caracteres');
    });
  });

  it('should throw an error if password is longer than 72 characters', async() => {
    const data = { email: 'admin@email.com', token: 'token', password: 'a'.repeat(73) };

    expect.assertions(1);
    return target.transform(data, metadata).catch((error) => {
      expect(error.getResponse().message).toContain('password deve ter no máximo 72 caracteres');
    });
  });

  it('should pass if all fields are valid', async() => {
    const data = {
      email: 'admin@email.com',
      token: 'a'.repeat(64),
      password: 'new-password',
    };

    const result = await target.transform(data, metadata);

    expect(result).toBeInstanceOf(ResetPasswordInputDto);
    expect(result).toEqual(data);
  });
});
