import type { FastifyReply, FastifyRequest } from "fastify";
import { ConfirmResetPasswordService } from "../../services/auth/Confirm-reset-password-service.js";

type ConfirmResetPasswordProps = {
  token: string
  password: string
  confirmPassword: string
}

export type ConfirmResetPasswordRequest = {
  Body: ConfirmResetPasswordProps
}

export class ConfirmResetPasswordController {
  private readonly confirmResetPasswordService: ConfirmResetPasswordService;
  
  constructor() {
    this.confirmResetPasswordService = new ConfirmResetPasswordService();
  }

  public async handle(request: FastifyRequest<ConfirmResetPasswordRequest>, reply: FastifyReply) {
    const {
      token,
      password
    } = request.body;

    this.confirmResetPasswordService.token = token;
    this.confirmResetPasswordService.password = password;

    await this.confirmResetPasswordService.execute();

    return reply.code(204).send();
  }
}
