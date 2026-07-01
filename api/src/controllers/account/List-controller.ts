import type { FastifyReply, FastifyRequest } from "fastify";
import { ListAccountsService } from "../../services/account/List-service.js";

export class ListAccountsController {
  private readonly listAccountsService: ListAccountsService;
 
  constructor() {
    this.listAccountsService = new ListAccountsService();
  }

  public async handle(request: FastifyRequest, reply: FastifyReply) {
    const accounts = await this.listAccountsService.execute();

    return reply.code(200).send(accounts);
  }
}