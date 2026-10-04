import { PartialType } from '@nestjs/swagger';
import { CreateOrderInputDto } from '../../create-order/dtos/create-order.dto';

export class EditOrderInputDto extends PartialType(CreateOrderInputDto) {}
