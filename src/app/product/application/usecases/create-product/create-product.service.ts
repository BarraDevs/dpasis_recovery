import { Inject, Injectable } from '@nestjs/common';
import { ProductAlreadyExistsError } from 'src/app/product/domain/errors/product-already-exists.error';
import { TOKENS } from 'src/core/di/token';
import type { IProductDao } from '../../persistence/dao/product-dao.interface';
import { CreateProductInputDto, CreateProductOutputDto } from './dtos/create-product.dto';

@Injectable()
export class CreateProduct {
  constructor(
    @Inject(TOKENS.ProductDao) private readonly productDao: IProductDao,
  ) {}

  public async execute(data: CreateProductInputDto): Promise<CreateProductOutputDto> {
    const existing = await this.productDao.findByCode(data.code);
    if (existing) {
      throw new ProductAlreadyExistsError(data.code);
    }

    const id = await this.productDao.save(data);
    return { id };
  }
}
