import type { FastifyReply, FastifyRequest } from "fastify";
import { ListCnpjsService } from "../../services/account/ListCNPJS-service.js";

type ListCnpjsProps = {
  signed: string,
  account_id: string | undefined
}

export type ListCnpjsRequestData = {
  Querystring: ListCnpjsProps
}

export class ListCNPJSController {
  private readonly listCnpjsService: ListCnpjsService;
  
  constructor() {
    this.listCnpjsService = new ListCnpjsService();
  }

  public async handle(request: FastifyRequest<ListCnpjsRequestData>, reply: FastifyReply) {
    this.listCnpjsService.cnpj_root = request.user.cnpj_root;

    const cnpjs = await this.listCnpjsService.execute();

    return reply.code(200).send({
      cnpjs,
    });
  }
}
