import type { FastifyReply, FastifyRequest } from "fastify";
import { SendResetPasswordLinkService } from "../../services/auth/Send-reset-password-link-service.js";

type SendResetPasswordLinkProps = {
  email: string
}

export type SendResetPasswordLinkRequest = {
  Body: SendResetPasswordLinkProps
}

export class SendResetPasswordLinkController {
  private readonly sendResetPasswordLink: SendResetPasswordLinkService;
  
  constructor() {
    this.sendResetPasswordLink = new SendResetPasswordLinkService();
  }

  public async handle(request: FastifyRequest<SendResetPasswordLinkRequest>, reply: FastifyReply) {
    const {
      email,
    } = request.body;

    this.sendResetPasswordLink.email = email;

    await this.sendResetPasswordLink.execute();

    return reply.code(204).send();
  }
}
