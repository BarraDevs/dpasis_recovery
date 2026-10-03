import { AppException } from 'src/core/filters/app.exception';

export class ProductAlreadyExistsError extends AppException {
  constructor(code: string) {
    super(`O código ${code} já está em uso.`, 409);
    this.name = 'ProductAlreadyExistsError';
  }
}
