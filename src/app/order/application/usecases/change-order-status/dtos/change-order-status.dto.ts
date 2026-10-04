import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { OrderStatus } from 'src/app/order/domain/enums/order-status.enum';

export class ChangeOrderStatusInputDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.APPROVED })
  @IsIn(Object.values(OrderStatus), { message: '$property deve ser um status válido' })
  status: OrderStatus;
}
