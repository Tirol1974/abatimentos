import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateAccountService } from "../../services/account/Create-service.js";

type CreateAccountData = {
  name: string;
  email: string;
  role: string;
}

export type CreateAccountRequest = {
  Body: CreateAccountData
}

export class CreateAccountController {
  private readonly createAccountService: CreateAccountService;
  
  constructor() {
    this.createAccountService = new CreateAccountService();
  }

  public async handle(request: FastifyRequest<CreateAccountRequest>, reply: FastifyReply) {
    const {
      name,
      email,
      role
    } = request.body;

    this.createAccountService.name = name;
    this.createAccountService.email = email;
    this.createAccountService.role = role;

    const account = await this.createAccountService.execute();

    return reply.code(201).send({
      account,
    });
  }

} 
