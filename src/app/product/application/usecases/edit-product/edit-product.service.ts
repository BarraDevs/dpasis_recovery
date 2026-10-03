import { Inject, Injectable } from '@nestjs/common';
import { ProductAlreadyExistsError } from 'src/app/product/domain/errors/product-already-exists.error';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { EditProductInputDto } from './dtos/edit-product.dto';

@Injectable()
export class EditProduct {
  constructor(
    @Inject(TOKENS.ProductDao) private readonly productDao: IProductDao,
  ) {}

  public async execute(id: number, data: EditProductInputDto): Promise<SuccessMessage> {
    const product = await this.productDao.findById(id);
    if (!product) {
      throw new ProductNotFoundError();
    }

    if (data.code !== undefined && data.code !== product.code) {
      const taken = await this.productDao.findByCode(data.code);
      if (taken) {
        throw new ProductAlreadyExistsError(data.code);
      }
    }

    await this.productDao.edit(id, data);

    return { message: 'Produto atualizado com sucesso' };
  }
}
