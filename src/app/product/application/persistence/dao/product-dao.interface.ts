import { ProductDto } from '../../dtos/product.dto';
import { CreateProductInputDto } from '../../usecases/create-product/dtos/create-product.dto';
import { EditProductInputDto } from '../../usecases/edit-product/dtos/edit-product.dto';
import { FindAllProductQueryDto } from '../../usecases/find-all-product/dtos/find-all-product.dto';

export interface IProductDao {
  findAll(queries: FindAllProductQueryDto): Promise<[ProductDto[], number]>;
  findById(id: number): Promise<ProductDto | null>;
  findByCode(code: string): Promise<ProductDto | null>;
  save(data: CreateProductInputDto): Promise<number>;
  edit(id: number, data: EditProductInputDto): Promise<void>;
  delete(id: number): Promise<void>;
  updateStatus(id: number, active: boolean): Promise<void>;
}
