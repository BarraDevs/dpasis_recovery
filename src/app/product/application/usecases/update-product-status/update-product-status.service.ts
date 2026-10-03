import { Inject, Injectable } from '@nestjs/common';
import { ProductNotFoundError } from 'src/app/product/domain/errors/product-not-found.error';
import { TOKENS } from 'src/core/di/token';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';

@Injectable()
export class UpdateProductStatus {
  constructor(
    @Inject(TOKENS.ProductDao) private readonly productDao: IProductDao,
  ) {}

  public async execute(id: number): Promise<SuccessMessage> {
    const product = await this.productDao.findById(id);
    if (!product) {
      throw new ProductNotFoundError();
    }

    await this.productDao.updateStatus(id, !product.active);

    return { message: 'Status do produto atualizado com sucesso' };
  }
}
