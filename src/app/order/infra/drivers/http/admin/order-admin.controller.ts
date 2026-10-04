import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { Claim } from 'src/app/authentication/domain/authorization/claim';
import { RequiredClaims } from 'src/app/authentication/infra/decorators/required-claims.decorator';
import { RequiredRoles } from 'src/app/authentication/infra/decorators/required-role.decorator';
import { OrderDto } from 'src/app/order/application/dtos/order.dto';
import { ActivateOrder } from 'src/app/order/application/usecases/activate-order/activate-order.service';
import { ChangeOrderStatus } from 'src/app/order/application/usecases/change-order-status/change-order-status.service';
import { ChangeOrderStatusInputDto } from 'src/app/order/application/usecases/change-order-status/dtos/change-order-status.dto';
import { CreateOrder } from 'src/app/order/application/usecases/create-order/create-order.service';
import { CreateOrderInputDto, CreateOrderOutputDto } from 'src/app/order/application/usecases/create-order/dtos/create-order.dto';
import { DeactivateOrder } from 'src/app/order/application/usecases/deactivate-order/deactivate-order.service';
import { DeleteOrder } from 'src/app/order/application/usecases/delete-order/delete-order.service';
import { EditOrderInputDto } from 'src/app/order/application/usecases/edit-order/dtos/edit-order.dto';
import { EditOrder } from 'src/app/order/application/usecases/edit-order/edit-order.service';
import { FindAllOrderQueryDto } from 'src/app/order/application/usecases/find-all-order/dtos/find-all-order.dto';
import { FindAllOrder } from 'src/app/order/application/usecases/find-all-order/find-all-order.service';
import { FindOrderById } from 'src/app/order/application/usecases/find-order-by-id/find-order-by-id.service';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import { Swagger } from 'src/infra/openapi/swagger';
import { Params } from 'src/infra/validators/class/dtos/params';
import { IPagination } from 'src/shared/value-objects/pagination/pagination.vo';

@Controller('admin/order')
@RequiredRoles(AccountRole.ADMIN)
export class OrderAdminController {
  constructor(
    private readonly createOrder: CreateOrder,
    private readonly findAllOrder: FindAllOrder,
    private readonly findOrderById: FindOrderById,
    private readonly editOrder: EditOrder,
    private readonly changeOrderStatus: ChangeOrderStatus,
    private readonly activateOrder: ActivateOrder,
    private readonly deactivateOrder: DeactivateOrder,
    private readonly deleteOrder: DeleteOrder,
  ) {}

  @Post()
  @RequiredClaims(Claim.ORDER_WRITE)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Criar orçamento',
    applyBadRequest: true,
    applyNotFound: true,
    createdResponse: CreateOrderOutputDto,
  })
  public create(@Body() body: CreateOrderInputDto): Promise<CreateOrderOutputDto> {
    return this.createOrder.execute(body);
  }

  @Get()
  @RequiredClaims(Claim.ORDER_READ)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Listar orçamentos com paginação, busca e filtros',
    applyBadRequest: true,
    okPaginatedResponse: OrderDto,
  })
  public findAll(@Query() queries: FindAllOrderQueryDto): Promise<IPagination<OrderDto>> {
    return this.findAllOrder.execute(queries);
  }

  @Patch(':id/status')
  @RequiredClaims(Claim.ORDER_WRITE)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Avançar ou cancelar o status do orçamento',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: SuccessMessage,
  })
  public updateStatus(@Param() params: Params, @Body() body: ChangeOrderStatusInputDto): Promise<SuccessMessage> {
    return this.changeOrderStatus.execute(params.id, body);
  }

  @Patch(':id/activate')
  @RequiredClaims(Claim.ORDER_WRITE)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Ativar orçamento',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: SuccessMessage,
  })
  public activate(@Param() params: Params): Promise<SuccessMessage> {
    return this.activateOrder.execute(params.id);
  }

  @Patch(':id/deactivate')
  @RequiredClaims(Claim.ORDER_WRITE)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Desativar orçamento',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: SuccessMessage,
  })
  public deactivate(@Param() params: Params): Promise<SuccessMessage> {
    return this.deactivateOrder.execute(params.id);
  }

  @Get(':id')
  @RequiredClaims(Claim.ORDER_READ)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Buscar orçamento por ID',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: OrderDto,
  })
  public findOne(@Param() params: Params): Promise<OrderDto> {
    return this.findOrderById.execute(params.id);
  }

  @Patch(':id')
  @RequiredClaims(Claim.ORDER_WRITE)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Editar orçamento',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: SuccessMessage,
  })
  public update(@Param() params: Params, @Body() body: EditOrderInputDto): Promise<SuccessMessage> {
    return this.editOrder.execute(params.id, body);
  }

  @Delete(':id')
  @RequiredClaims(Claim.ORDER_WRITE)
  @Swagger({
    tags: ['Orçamentos'],
    summary: 'Excluir orçamento em cotação',
    applyBadRequest: true,
    applyNotFound: true,
    okResponse: SuccessMessage,
  })
  public remove(@Param() params: Params): Promise<SuccessMessage> {
    return this.deleteOrder.execute(params.id);
  }
}
