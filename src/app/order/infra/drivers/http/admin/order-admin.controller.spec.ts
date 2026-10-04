import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { AuthenticationGuardsModule } from 'src/app/authentication/application/guards/guards.module';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import { Params } from 'src/infra/validators/class/dtos/params';
import { ActivateOrder } from 'src/app/order/application/usecases/activate-order/activate-order.service';
import { ChangeOrderStatus } from 'src/app/order/application/usecases/change-order-status/change-order-status.service';
import { ChangeOrderStatusInputDto } from 'src/app/order/application/usecases/change-order-status/dtos/change-order-status.dto';
import { CreateOrder } from 'src/app/order/application/usecases/create-order/create-order.service';
import { CreateOrderInputDto, CreateOrderOutputDto } from 'src/app/order/application/usecases/create-order/dtos/create-order.dto';
import { DeactivateOrder } from 'src/app/order/application/usecases/deactivate-order/deactivate-order.service';
import { DeleteOrder } from 'src/app/order/application/usecases/delete-order/delete-order.service';
import { EditOrder } from 'src/app/order/application/usecases/edit-order/edit-order.service';
import { FindAllOrder } from 'src/app/order/application/usecases/find-all-order/find-all-order.service';
import { FindOrderById } from 'src/app/order/application/usecases/find-order-by-id/find-order-by-id.service';
import { OrderAdminController } from './order-admin.controller';

describe('OrderAdminController - Unit tests', () => {
  let sut: OrderAdminController;
  let createOrder: CreateOrder;
  let changeOrderStatus: ChangeOrderStatus;

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      imports: [AuthenticationGuardsModule],
      controllers: [OrderAdminController],
      providers: [
        { provide: CreateOrder, useValue: createMock<CreateOrder>() },
        { provide: FindAllOrder, useValue: createMock<FindAllOrder>() },
        { provide: FindOrderById, useValue: createMock<FindOrderById>() },
        { provide: EditOrder, useValue: createMock<EditOrder>() },
        { provide: ChangeOrderStatus, useValue: createMock<ChangeOrderStatus>() },
        { provide: ActivateOrder, useValue: createMock<ActivateOrder>() },
        { provide: DeactivateOrder, useValue: createMock<DeactivateOrder>() },
        { provide: DeleteOrder, useValue: createMock<DeleteOrder>() },
      ],
    }).compile();

    sut = module.get(OrderAdminController);
    createOrder = module.get(CreateOrder);
    changeOrderStatus = module.get(ChangeOrderStatus);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should delegate create', async() => {
    const body = createMock<CreateOrderInputDto>();
    const output = createMock<CreateOrderOutputDto>();
    const spy = jest.spyOn(createOrder, 'execute').mockResolvedValue(output);

    await expect(sut.create(body)).resolves.toEqual(output);
    expect(spy).toHaveBeenCalledWith(body);
  });

  it('should delegate updateStatus', async() => {
    const params = createMock<Params>();
    const body = createMock<ChangeOrderStatusInputDto>();
    const output = createMock<SuccessMessage>();
    const spy = jest.spyOn(changeOrderStatus, 'execute').mockResolvedValue(output);

    await expect(sut.updateStatus(params, body)).resolves.toEqual(output);
    expect(spy).toHaveBeenCalledWith(params.id, body);
  });
});
