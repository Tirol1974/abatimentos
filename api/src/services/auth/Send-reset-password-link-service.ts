import { createHash, randomBytes } from "node:crypto";
import { AccountRepository } from "../../repositories/Account-repository.js";
import { SendEmailService } from "../email/send-email-service.js";
import { ResetPasswordTokenRepository } from "../../repositories/ResetPasswordToken-repository.js";

export class SendResetPasswordLinkService {
  public email: string = "";

  private readonly accountRepository: AccountRepository;
  private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.resetPasswordTokenRepository = new ResetPasswordTokenRepository();
  }

  public async execute() {
    this.accountRepository.email = this.email;

    const account = await this.accountRepository.findByEmail();

    if (!account) {
      return;
    }
    
    const token = this.generateToken();
    const expiresInMinutes = 5;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    this.resetPasswordTokenRepository.account_id = account.id;
    await this.resetPasswordTokenRepository.invalidateAccountResetPasswordTokens();

    this.resetPasswordTokenRepository.token_hash = createHash("sha256").update(token).digest("hex");
    this.resetPasswordTokenRepository.expires_at = expiresAt;
    await this.resetPasswordTokenRepository.create();

    const sendEmailService = new SendEmailService();
    
    sendEmailService.from = process.env.MAIL_FROM!;
    sendEmailService.subject = "Abatimentos Tirol - Atualização de Senha";
    sendEmailService.to = this.email;
    sendEmailService.template = "reset-password";
    sendEmailService.templateData = {
      account,
      token,
      portal_url: process.env.PORTAL_URL ?? "https://abatimentos.tirol.com.br",
    };

    await sendEmailService.execute();
  }

  private generateToken() {
    return randomBytes(32).toString("base64url");
  }
}