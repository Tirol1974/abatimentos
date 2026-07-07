import type { FastifyReply, FastifyRequest } from "fastify";
import { AccountDetailsService } from "../../services/account/Details-service.js";

export type AccountDetailsControllerRequest = {
  Params: {
    account_id: number
  }
}

export class AccountDetailsController {
  private readonly accountDetailsService: AccountDetailsService;

  constructor() {
    this.accountDetailsService = new AccountDetailsService();
  }

  public async handle(request: FastifyRequest<AccountDetailsControllerRequest>, reply: FastifyReply) {
    const {
      account_id
    } = request.params;

    this.accountDetailsService.account_id = Number(account_id);

    const account = await this.accountDetailsService.execute();

    return reply.code(200).send({ account });
  }
}