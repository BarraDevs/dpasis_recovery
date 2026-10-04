import { Module } from '@nestjs/common';
import { AuthenticationGuardsModule } from 'src/app/authentication/application/guards/guards.module';
import { ClientModule } from 'src/app/client/client/client.module';
import { CompanyModule } from 'src/app/company/company/company.module';
import { ProductModule } from 'src/app/product/product.module';
import { SellerModule } from 'src/app/seller/seller.module';
import { ServiceCatalogModule } from 'src/app/service/service-catalog/service-catalog.module';
import { OrderPersistenceModule } from './application/persistence/order-persistence.module';
import { ActivateOrder } from './application/usecases/activate-order/activate-order.service';
import { ChangeOrderStatus } from './application/usecases/change-order-status/change-order-status.service';
import { ComposeOrderItems } from './application/usecases/create-order/compose-order-items';
import { CreateOrder } from './application/usecases/create-order/create-order.service';
import { DeactivateOrder } from './application/usecases/deactivate-order/deactivate-order.service';
import { DeleteOrder } from './application/usecases/delete-order/delete-order.service';
import { EditOrder } from './application/usecases/edit-order/edit-order.service';
import { FindAllOrder } from './application/usecases/find-all-order/find-all-order.service';
import { FindOrderById } from './application/usecases/find-order-by-id/find-order-by-id.service';
import { OrderAdminController } from './infra/drivers/http/admin/order-admin.controller';

@Module({
  imports: [
    OrderPersistenceModule,
    AuthenticationGuardsModule,
    ClientModule,
    CompanyModule,
    SellerModule,
    ProductModule,
    ServiceCatalogModule,
  ],
  controllers: [
    OrderAdminController,
  ],
  providers: [
    ComposeOrderItems,
    CreateOrder,
    EditOrder,
    DeleteOrder,
    FindAllOrder,
    FindOrderById,
    ChangeOrderStatus,
    ActivateOrder,
    DeactivateOrder,
  ],
  exports: [
    FindOrderById,
  ],
})
export class OrderModule {}
