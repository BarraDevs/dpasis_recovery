import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/infra/validators/class/decorators/trim/trim';

export class ForgotPasswordInputDto {
  @ApiProperty({ example: 'admin@email.com' })
  @IsString({ message: '$property deve ser uma string' })
  @IsNotEmpty({ message: '$property é obrigatório' })
  @IsEmail({}, { message: '$property deve ser um e-mail válido' })
  @Trim()
  email: string;
}
