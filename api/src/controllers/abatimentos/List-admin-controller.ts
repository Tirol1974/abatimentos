import type { FastifyReply, FastifyRequest } from "fastify";
import { ListAdminAbatimentosService } from "../../services/abatimentos/List-admin-service.js";

export class ListAdminAbatimentosController {
  private readonly listAdminAbatimentosService: ListAdminAbatimentosService;

  constructor() {
    this.listAdminAbatimentosService = new ListAdminAbatimentosService();
  }

  public async handle(request: FastifyRequest, reply: FastifyReply) {
    const abatimentos = await this.listAdminAbatimentosService.execute();

    return reply.code(200).send(abatimentos);
  }
}
