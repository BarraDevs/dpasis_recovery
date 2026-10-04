import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { ItemType } from 'src/app/order/domain/enums/item-type.enum';
import { Trim } from 'src/infra/validators/class/decorators/trim/trim';

export class CreateOrderItemInputDto {
  @ApiProperty({ enum: ItemType, example: ItemType.PRODUCT })
  @IsIn(Object.values(ItemType), { message: '$property deve ser PRODUCT ou SERVICE' })
  type: ItemType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  productId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  serviceId?: number;

  @ApiProperty({ example: 2 })
  @IsNumber({}, { message: '$property deve ser um número' })
  @IsPositive({ message: '$property deve ser um número positivo' })
  quantity: number;

  @ApiPropertyOptional({ example: 2990 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  unitValueInCents?: number;

  @ApiPropertyOptional({ example: '01.07' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(32, { message: '$property deve ter no máximo 32 caracteres' })
  @Trim()
  serviceActivityCode?: string;
}

export class CreateOrderInputDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  clientId: number;

  @ApiProperty({ example: 1 })
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  companyId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(1, { message: '$property deve ser maior ou igual a 1' })
  sellerId?: number;

  @ApiPropertyOptional({ example: 'CIF' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(128, { message: '$property deve ter no máximo 128 caracteres' })
  @Trim()
  freightMode?: string;

  @ApiPropertyOptional({ example: 'Transportadora Sul' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(128, { message: '$property deve ter no máximo 128 caracteres' })
  @Trim()
  carrierName?: string;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  freightValueInCents?: number;

  @ApiPropertyOptional({ example: 'Proposta comercial' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(128, { message: '$property deve ter no máximo 128 caracteres' })
  @Trim()
  commercialProcess?: string;

  @ApiPropertyOptional({ example: 'Entregar no período da manhã.' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(8192, { message: '$property deve ter no máximo 8192 caracteres' })
  @Trim()
  observation?: string;

  @ApiPropertyOptional({ example: 'Nota interna.' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(8192, { message: '$property deve ter no máximo 8192 caracteres' })
  @Trim()
  commercialNote?: string;

  @ApiProperty({ type: [CreateOrderItemInputDto] })
  @IsArray({ message: '$property deve ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInputDto)
  items: CreateOrderItemInputDto[];
}

export class CreateOrderOutputDto {
  id: number;
  code: string;
}
