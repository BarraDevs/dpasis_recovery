import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AccountRole } from 'src/app/account/domain/enums/account-role.enum';
import { ForgotPasswordInputDto } from 'src/app/authentication/application/usecases/forgot-password/dtos/forgot-password.dto';
import { ForgotPassword } from 'src/app/authentication/application/usecases/forgot-password/forgot-password.service';
import { ResetPasswordInputDto } from 'src/app/authentication/application/usecases/reset-password/dtos/reset-password.dto';
import { ResetPassword } from 'src/app/authentication/application/usecases/reset-password/reset-password.service';
import { SignInWithCredentialAndPasswordInputDto, SignInWithCredentialAndPasswordOutputDto } from 'src/app/authentication/application/usecases/signin-with-credential-and-password/dtos/signin-with-credential-and-password.dto';
import { SignInWithCredentialAndPassword } from 'src/app/authentication/application/usecases/signin-with-credential-and-password/signin-with-credential-and-password.service';
import { SuccessMessage } from 'src/core/dtos/success-message.dto';
import { Swagger } from 'src/infra/openapi/swagger';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly signInWithCredentialAndPassword: SignInWithCredentialAndPassword,
    private readonly forgotPassword: ForgotPassword,
    private readonly resetPassword: ResetPassword,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Swagger({
    tags: ['Autenticação'],
    summary: 'Login com email e senha',
    applyBadRequest: true,
    applyForbidden: true,
    okResponse: SignInWithCredentialAndPasswordOutputDto,
  })
  public async signInWithCredential(@Body() body: SignInWithCredentialAndPasswordInputDto): Promise<SignInWithCredentialAndPasswordOutputDto> {
    return this.signInWithCredentialAndPassword.execute(body);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Swagger({
    tags: ['Autenticação'],
    summary: 'Solicitar redefinição de senha (administradores)',
    description: 'Envia o link de redefinição por e-mail. A resposta é a mesma exista a conta ou não, para não revelar quais e-mails têm cadastro.',
    applyBadRequest: true,
    applyServiceUnavailable: true,
    okResponse: SuccessMessage,
  })
  public async forgotPass(@Body() body: ForgotPasswordInputDto): Promise<SuccessMessage> {
    return this.forgotPassword.execute(body, AccountRole.ADMIN);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Swagger({
    tags: ['Autenticação'],
    summary: 'Redefinir a senha com o token recebido por e-mail (administradores)',
    description: 'O token vale por tempo limitado e só pode ser usado uma vez.',
    applyBadRequest: true,
    okResponse: SuccessMessage,
  })
  public async resetPass(@Body() body: ResetPasswordInputDto): Promise<SuccessMessage> {
    return this.resetPassword.execute(body, AccountRole.ADMIN);
  }
}
