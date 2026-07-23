import type { FastifyReply, FastifyRequest } from "fastify";
import type { SapClientProps } from "../../services/account/ListCNPJS-service.js";
import { FetchSapPartidasService } from "../../services/partidas/fetch-partidas-service.js";

type FetchPartidasProps = {
  kunnr_list: SapClientProps[],
  doc_type: string[]
}

export type FetchPartidasRequest = {
  Body: FetchPartidasProps
}

export class FetchPartidasController {
  private readonly fetchSapPartidasService: FetchSapPartidasService;
  
  constructor() {
    this.fetchSapPartidasService = new FetchSapPartidasService();
  }

  public async handle(request: FastifyRequest<FetchPartidasRequest>, reply: FastifyReply) {
    const {
      kunnr_list,
      doc_type
    } = request.body;

    this.fetchSapPartidasService.account_id = request.user.sub;
    this.fetchSapPartidasService.kunnr_list = kunnr_list;
    this.fetchSapPartidasService.doc_type = doc_type;

    const {
      partidas,
      resumo
    } = await this.fetchSapPartidasService.execute();

    return reply.code(200).send({
      resumo,
      partidas,
    });
  }

}
