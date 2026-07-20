import type { FastifyReply, FastifyRequest } from "fastify";
import { SignInService } from "../../services/auth/Sign-in-service.js";

type SignInData = {
  email: string
  password: string
}

export type SignInRequest = {
  Body: SignInData
}

export class SignInController {
  private readonly signInService: SignInService;
  
  constructor() {
    this.signInService = new SignInService();
  }

  public async handle(request: FastifyRequest<SignInRequest>, reply: FastifyReply) {
    const {
      email,
      password
    } = request.body;

    this.signInService.email = email;
    this.signInService.password = password;

    const result = await this.signInService.execute();

    return reply.code(200).send(result);
  }
}
