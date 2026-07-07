import type { FastifyReply, FastifyRequest } from "fastify";
import { ListCNPJSService } from "../../services/account/ListCNPJS-service.js";

type ListCnpjsProps = {
  signed: string,
  account_id: string | undefined
}

export type ListCnpjsRequestData = {
  Querystring: ListCnpjsProps
}

export class ListCNPJSController {
  private readonly listCNPJSService: ListCNPJSService;
  
  constructor() {
    this.listCNPJSService = new ListCNPJSService();
  }

  public async handle(request: FastifyRequest<ListCnpjsRequestData>, reply: FastifyReply) {
    const {
      signed,
      account_id
    } = request.query;

    if (signed == 'true') {
      this.listCNPJSService.account_id = request.user.sub;
    } else {
      this.listCNPJSService.account_id = Number(account_id);
    }

    const cnpjs = await this.listCNPJSService.execute();

    return reply.code(200).send({
      cnpjs,
    });
  }
}
