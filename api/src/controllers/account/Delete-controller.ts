import type { FastifyReply, FastifyRequest } from "fastify";
import { AccountDeleteService } from "../../services/account/Delete-service.js";

type AccountDeleteParams = {
  account_id: number;
}

export type AccountDeleteRequest = {
  Params: AccountDeleteParams
}

export class AccountDeleteController {
  private readonly accountDeleteService: AccountDeleteService;

  constructor() {
    this.accountDeleteService = new AccountDeleteService();
  }

  public async handle(request: FastifyRequest<AccountDeleteRequest>, reply: FastifyReply) {
    const {
      account_id
    } = request.params;

    this.accountDeleteService.account_id = Number(account_id);

    await this.accountDeleteService.execute();

    return reply.code(204).send();
  }
}
