import type { FastifyReply, FastifyRequest } from "fastify";
import { ListAbatimentosService } from "../../services/abatimentos/List-service.js";

export class ListAbatimentosController {
  private readonly listAbatimentosService: ListAbatimentosService;

  constructor() {
    this.listAbatimentosService = new ListAbatimentosService();
  }

  public async handle(request: FastifyRequest, reply: FastifyReply) {
    this.listAbatimentosService.account_id = request.user.sub;

    const abatimentos = await this.listAbatimentosService.execute();

    return reply.code(200).send(abatimentos);
  }
}
