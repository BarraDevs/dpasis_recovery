export class SendPasswordResetMailInputDto {
  /** E-mail do destinatário (o da conta). */
  to: string;
  name: string;
  /** Token em claro. Só trafega até aqui; no banco fica o hash. */
  token: string;
  expiresInMinutes: number;
}
