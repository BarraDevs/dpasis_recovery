import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Trim } from 'src/infra/validators/class/decorators/trim/trim';

export class CreateProductInputDto {
  @ApiProperty({ example: 'PRD-001' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @MaxLength(64, { message: '$property deve ter no máximo 64 caracteres' })
  @Trim()
  code: string;

  @ApiPropertyOptional({ example: 'Eletrônicos' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(128, { message: '$property deve ter no máximo 128 caracteres' })
  @Trim()
  group1?: string;

  @ApiPropertyOptional({ example: 'Acessórios' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(128, { message: '$property deve ter no máximo 128 caracteres' })
  @Trim()
  group2?: string;

  @ApiProperty({ example: 'Leitor de código de barras' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @MaxLength(512, { message: '$property deve ter no máximo 512 caracteres' })
  @Trim()
  description: string;

  @ApiPropertyOptional({ example: 'USB, preto' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(512, { message: '$property deve ter no máximo 512 caracteres' })
  @Trim()
  complement?: string;

  @ApiPropertyOptional({ example: 'FAB-88' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(64, { message: '$property deve ter no máximo 64 caracteres' })
  @Trim()
  manufacturerCode?: string;

  @ApiProperty({ example: 'UN' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @MaxLength(16, { message: '$property deve ter no máximo 16 caracteres' })
  @Trim()
  unitOfMeasure: string;

  @ApiProperty({ example: '84716053' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @MaxLength(8, { message: '$property deve ter no máximo 8 caracteres' })
  @Trim()
  ncm: string;

  @ApiPropertyOptional({ example: 'Acme' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(128, { message: '$property deve ter no máximo 128 caracteres' })
  @Trim()
  brand?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  economicLot?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  minStock?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  maxStock?: number;

  @ApiPropertyOptional({ example: 365 })
  @IsOptional()
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  warrantyDays?: number;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  weightInGrams?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  heightInCm?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  lengthInCm?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  widthInCm?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  markup?: number;

  @ApiPropertyOptional({ example: 0.3 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  marginB?: number;

  @ApiPropertyOptional({ example: 'BRL' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(3, { message: '$property deve ter no máximo 3 caracteres' })
  @Trim()
  currency?: string;

  @ApiPropertyOptional({ example: 5.42 })
  @IsOptional()
  @IsNumber({}, { message: '$property deve ser um número' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  quotation?: number;

  @ApiProperty({ example: 1500 })
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  unitCostInCents: number;

  @ApiProperty({ example: 2990 })
  @IsInt({ message: '$property deve ser um número inteiro' })
  @Min(0, { message: '$property deve ser maior ou igual a 0' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  unitPriceInCents: number;

  @ApiPropertyOptional({ example: '7891234567890' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(14, { message: '$property deve ter no máximo 14 caracteres' })
  @Trim()
  ean?: string;

  @ApiPropertyOptional({ example: 'Observação interna do produto.' })
  @IsOptional()
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property não pode ser vazio' })
  @MaxLength(8192, { message: '$property deve ter no máximo 8192 caracteres' })
  @Trim()
  additionalInfo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: '$property deve ser um booleano' })
  active?: boolean;
}

export class CreateProductOutputDto {
  id: number;
}
