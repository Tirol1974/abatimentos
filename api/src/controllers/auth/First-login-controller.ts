import type { FastifyReply, FastifyRequest } from "fastify";
import { SignInService } from "../../services/auth/Sign-in-service.js";
import { FirstLoginService } from "../../services/auth/First-login-service.js";

type FirstLoginData = {
  email: string
}

export type FirstLoginRequest = {
  Body: FirstLoginData
}

export class FirstLoginController {
  private readonly firstLoginService: FirstLoginService;
  
  constructor() {
    this.firstLoginService = new FirstLoginService();
  }

  public async handle(request: FastifyRequest<FirstLoginRequest>, reply: FastifyReply) {
    const {
      email,
    } = request.body;

    this.firstLoginService.email = email;

    await this.firstLoginService.execute();

    return reply.code(204).send();
  }
}
