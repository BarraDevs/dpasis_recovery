import { Inject, Injectable } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { ConfigService } from 'src/core/config/config.service';
import { TOKENS } from 'src/core/di/token';
import { LogContext, type ILoggerGateway } from 'src/infra/logger/logger.gateway';
import { ExternalApiError } from 'src/shared/errors/external-api.error';
import { IAccountMailGateway } from '../../account-mail.gateway';
import { SendPasswordResetMailInputDto } from '../../dtos/account-mail.dto';

@Injectable()
export class AccountMailSmtpAdapterGateway implements IAccountMailGateway {
  private transporter: Transporter | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(TOKENS.LoggerGateway) private readonly logger: ILoggerGateway,
  ) {}

  public async sendPasswordReset(input: SendPasswordResetMailInputDto): Promise<void> {
    try {
      await this.getTransporter().sendMail({
        from: this.configService.smtpFrom,
        to: input.to,
        subject: 'Redefinição de senha',
        text: this.buildPasswordResetText(input),
      });

      // O corpo da mensagem (e o token) nunca vai para o log.
      this.logger.debug(LogContext.SMTP, {
        adapter: 'smtp',
        action: 'sendPasswordReset',
        body: { to: input.to },
      });
    }
    catch (error) {
      this.logger.error(LogContext.SMTP, {
        adapter: 'smtp',
        action: 'sendPasswordReset',
        body: { to: input.to },
        error,
      });

      throw new ExternalApiError('Não foi possível enviar o e-mail de redefinição de senha. Tente novamente em instantes.');
    }
  }

  private buildPasswordResetText(input: SendPasswordResetMailInputDto): string {
    const link = new URL(this.configService.passwordResetUrl);
    link.searchParams.set('email', input.to);
    link.searchParams.set('token', input.token);

    return [
      `Olá, ${input.name}.`,
      '',
      'Recebemos um pedido para redefinir a senha da sua conta. Para escolher uma nova senha, acesse:',
      link.toString(),
      '',
      `O link vale por ${input.expiresInMinutes} minutos e só pode ser usado uma vez.`,
      'Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.',
    ].join('\n');
  }

  /** Criado sob demanda e reusado: o transporter mantém o pool de conexões SMTP. */
  private getTransporter(): Transporter {
    if (!this.transporter) {
      const port = this.configService.smtpPort;

      this.transporter = createTransport({
        host: this.configService.smtpHost,
        port,
        secure: port === 465,
        auth: {
          user: this.configService.smtpUsername,
          pass: this.configService.smtpPassword,
        },
      });
    }

    return this.transporter;
  }
}
