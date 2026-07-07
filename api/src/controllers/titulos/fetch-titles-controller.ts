import type { FastifyReply, FastifyRequest } from "fastify";
import { FetchTitlesService } from "../../services/titulos/fetch-titles-service.js";

export class FetchTitlesController {
  private readonly fetchTitlesService: FetchTitlesService;
  
  constructor() {
    this.fetchTitlesService = new FetchTitlesService();
  }

  public async handle(request: FastifyRequest, reply: FastifyReply) {
    this.fetchTitlesService.cnpj = request.user.cnpj;
    
    const titles = await this.fetchTitlesService.execute();

    return reply.code(200).send({
      titles,
    });
  }

}