import type { FastifyReply, FastifyRequest } from "fastify";
import { ChangePasswordService } from "../../services/auth/Change-password-service.js";
import { ChangeFirstLoginService } from "../../services/auth/Change-first-login-service.js";

type ChangePasswordProps = {
  password: string
}

export type ChangePasswordRequest = {
  Body: ChangePasswordProps
}

export class ChangePasswordController {
  private readonly changePasswordService: ChangePasswordService;
  private readonly changeFirstLoginService: ChangeFirstLoginService;
 
  constructor() {
    this.changePasswordService = new ChangePasswordService();
    this.changeFirstLoginService = new ChangeFirstLoginService();
  }

  public async handle(request: FastifyRequest<ChangePasswordRequest>, reply: FastifyReply) {
    const {
      password
    } = request.body;

    this.changePasswordService.account_id = request.user.sub;
    this.changePasswordService.password = password;

    const account = await this.changePasswordService.execute();

    if (account.first_login) {
      this.changeFirstLoginService.account_id = request.user.sub;

      await this.changeFirstLoginService.execute();
    }

    return reply.code(200).send({
      message: "Senha alterada com sucesso"
    });
  }
}
