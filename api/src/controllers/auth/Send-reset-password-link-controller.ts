import type { FastifyReply, FastifyRequest } from "fastify";
import { SendResetPasswordLinkService } from "../../services/auth/Send-reset-password-link-service.js";
import { VerifyRecaptchaService } from "../../services/security/Verify-recaptcha-service.js";

type SendResetPasswordLinkProps = {
  email: string
  recaptcha_token: string
}

export type SendResetPasswordLinkRequest = {
  Body: SendResetPasswordLinkProps
}

export class SendResetPasswordLinkController {
  private readonly sendResetPasswordLink: SendResetPasswordLinkService;
  private readonly verifyRecaptchaService: VerifyRecaptchaService;
  
  constructor() {
    this.sendResetPasswordLink = new SendResetPasswordLinkService();
    this.verifyRecaptchaService = new VerifyRecaptchaService();
  }

  public async handle(request: FastifyRequest<SendResetPasswordLinkRequest>, reply: FastifyReply) {
    const {
      email,
      recaptcha_token
    } = request.body;

    this.sendResetPasswordLink.email = email;

    this.verifyRecaptchaService.token = recaptcha_token;
    this.verifyRecaptchaService.expected_action = "send_reset_password_link";

    await this.verifyRecaptchaService.execute();

    await this.sendResetPasswordLink.execute();

    return reply.code(204).send();
  }
}
