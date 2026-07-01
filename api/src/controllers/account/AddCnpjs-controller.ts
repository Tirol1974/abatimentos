import type { FastifyReply, FastifyRequest } from "fastify";
import { AccountAddCnpjsService } from "../../services/account/AddCnpjs-service.js";

type AccountAddCnpjsData = {
  cnpjs: string[]
  account_id: number
}

export type AccountAddCnpjsRequest = {
  Body: AccountAddCnpjsData
}

export class AccountAddCnpjsController {
  private readonly accountAddCnpjsService: AccountAddCnpjsService;
  
  constructor() {
    this.accountAddCnpjsService = new AccountAddCnpjsService();
  }

  public async handle(request: FastifyRequest<AccountAddCnpjsRequest>, reply: FastifyReply) {
    const {
      cnpjs,
      account_id
    } = request.body;

    this.accountAddCnpjsService.cnpjs = cnpjs;
    this.accountAddCnpjsService.account_id = account_id;

    const count = await this.accountAddCnpjsService.execute();

    return reply.code(201).send(count);
  }
}
