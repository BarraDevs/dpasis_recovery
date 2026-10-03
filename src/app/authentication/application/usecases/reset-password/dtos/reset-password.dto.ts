import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from 'src/infra/validators/class/decorators/trim/trim';

export class ResetPasswordInputDto {
  @ApiProperty({ example: 'admin@email.com' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @IsEmail({}, { message: '$property deve ser um e-mail válido' })
  @Trim()
  email: string;

  @ApiProperty({ example: '3f0c9b7a5d1e48c2a6b4f8e0d2c1a9b73f0c9b7a5d1e48c2a6b4f8e0d2c1a9b7' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @MaxLength(64, { message: '$property deve ter no máximo 64 caracteres' })
  @Trim()
  token: string;

  // O limite de 72 é do bcrypt: acima disso ele ignora o resto da senha em silêncio.
  @ApiProperty({ example: 'nova-senha-123' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @MinLength(6, { message: '$property deve ter no mínimo 6 caracteres' })
  @MaxLength(72, { message: '$property deve ter no máximo 72 caracteres' })
  @Trim()
  password: string;
}
