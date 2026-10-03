import { Injectable } from '@nestjs/common';
import { ExternalApiError } from 'src/shared/errors/external-api.error';
import { IAccountMailGateway } from '../../account-mail.gateway';
import { SendPasswordResetMailInputDto } from '../../dtos/account-mail.dto';

@Injectable()
export class AccountMailFakeAdapterGateway implements IAccountMailGateway {
  public readonly sentPasswordResets: SendPasswordResetMailInputDto[] = [];
  /** Permite ao teste simular o canal fora do ar sem mexer no transporte. */
  public deliver = true;

  public async sendPasswordReset(input: SendPasswordResetMailInputDto): Promise<void> {
    if (!this.deliver) {
      throw new ExternalApiError('Não foi possível enviar o e-mail de redefinição de senha.');
    }

    this.sentPasswordResets.push(input);
  }
}
