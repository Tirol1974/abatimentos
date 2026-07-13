import type { FastifyReply, FastifyRequest } from "fastify";
import { AccountUpdateService } from "../../services/account/Update-service.js";

type AccountUpdateProps = {
  account_id: number
  name: string
  email: string
  role: string
  cnpj_root: string
}

export type AccountUpdateRequest = {
  Body: AccountUpdateProps
}

export class AccountUpdateController {
  private readonly accountUpdateService: AccountUpdateService;

  constructor() {
    this.accountUpdateService = new AccountUpdateService();
  }

  public async handle(
    request: FastifyRequest<AccountUpdateRequest>,
    reply: FastifyReply
  ) {
    const {
      account_id,
      name,
      email,
      role,
      cnpj_root
    } = request.body;

    this.accountUpdateService.account_id = account_id;
    this.accountUpdateService.name = name;
    this.accountUpdateService.email = email;
    this.accountUpdateService.role = role;
    this.accountUpdateService.cnpj_root = cnpj_root;

    const account = await this.accountUpdateService.execute();

    return reply.code(200).send({ account });
  }
}