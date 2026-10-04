import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { OrderStatus } from 'src/app/order/domain/enums/order-status.enum';
import { StringToNumber } from 'src/infra/validators/class/decorators/string-number/string-number';
import { Queries } from 'src/infra/validators/class/dtos/queries/queries.dto';

export class FindAllOrderQueryDto extends Queries {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  @StringToNumber()
  clientId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  @StringToNumber()
  companyId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  @StringToNumber()
  sellerId?: number;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsIn(Object.values(OrderStatus), { message: '$property deve ser um status válido' })
  status?: OrderStatus;
}
