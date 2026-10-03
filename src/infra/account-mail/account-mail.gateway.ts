import { SendPasswordResetMailInputDto } from './dtos/account-mail.dto';

export interface IAccountMailGateway {
  /**
   * Entrega ao dono da conta o link de redefinição de senha.
   *
   * Ao contrário de `IAlertGateway.send`, **lança** (`ExternalApiError`) quando a entrega falha: aqui
   * o destinatário é uma pessoa esperando o e-mail, e devolver sucesso sem ter enviado é pior do que
   * avisar que o canal está fora.
   */
  sendPasswordReset(input: SendPasswordResetMailInputDto): Promise<void>;
}
