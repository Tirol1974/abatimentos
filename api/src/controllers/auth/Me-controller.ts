import type { FastifyReply, FastifyRequest } from "fastify";
import { MeService } from "../../services/auth/Me-service.js";

export class MeController {
  private readonly meService: MeService;
 
  constructor() {
    this.meService = new MeService();
  }

  public async handle(request: FastifyRequest, reply: FastifyReply) {
    this.meService.account_id = request.user.sub;
    this.meService.cnpj = request.user.cnpj;

    const account = await this.meService.execute();

    return reply.code(200).send({
      account
    });
  }
}