import type { FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "../../utils/ApiError.js";
import { ListCNPJSService } from "../../services/account/ListCNPJS-service.js";

export class ListCNPJSController {
  private readonly listCNPJSService: ListCNPJSService;
  
  constructor() {
    this.listCNPJSService = new ListCNPJSService();
  }

  public async handle(request: FastifyRequest, reply: FastifyReply) {
    this.listCNPJSService.account_id = request.user.sub;

    const cnpjs = await this.listCNPJSService.execute();

    return reply.code(200).send({
      cnpjs,
    });
  }
}
