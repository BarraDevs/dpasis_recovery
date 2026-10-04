import { Module } from '@nestjs/common';
import { AuthenticationGuardsModule } from 'src/app/authentication/application/guards/guards.module';
import { ProductPersistenceModule } from './application/persistence/product-persistence.module';
import { CreateProduct } from './application/usecases/create-product/create-product.service';
import { DeleteProduct } from './application/usecases/delete-product/delete-product.service';
import { EditProduct } from './application/usecases/edit-product/edit-product.service';
import { FindAllProduct } from './application/usecases/find-all-product/find-all-product.service';
import { FindProductById } from './application/usecases/find-product-by-id/find-product-by-id.service';
import { UpdateProductStatus } from './application/usecases/update-product-status/update-product-status.service';
import { ProductAdminController } from './infra/drivers/http/admin/product-admin.controller';

@Module({
  imports: [
    ProductPersistenceModule,
    AuthenticationGuardsModule,
  ],
  controllers: [
    ProductAdminController,
  ],
  providers: [
    CreateProduct,
    DeleteProduct,
    EditProduct,
    FindAllProduct,
    FindProductById,
    UpdateProductStatus,
  ],
  exports: [
    FindProductById,
  ],
})
export class ProductModule {}
