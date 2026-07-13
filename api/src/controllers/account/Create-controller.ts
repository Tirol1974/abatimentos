import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateAccountService } from "../../services/account/Create-service.js";

type CreateAccountData = {
  name: string;
  email: string;
  role: string;
  cnpj_root: string;
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
      role,
      cnpj_root
    } = request.body;

    this.createAccountService.name = name;
    this.createAccountService.email = email;
    this.createAccountService.role = role;
    this.createAccountService.cnpj_root = cnpj_root;

    const account = await this.createAccountService.execute();

    return reply.code(201).send({
      account,
    });
  }

} 
