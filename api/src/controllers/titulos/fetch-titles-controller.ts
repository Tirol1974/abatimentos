import type { FastifyReply, FastifyRequest } from "fastify";
import { SignInService } from "../../services/auth/Sign-in-service.js";
import { FetchTitlesService } from "../../services/titulos/fetch-titles-service.js";

type SignInData = {
  email: string
  password: string
}

export type SignInRequest = {
  Body: SignInData
}

export class FetchTitlesController {
  private readonly fetchTitlesService: FetchTitlesService;
  
  constructor() {
    this.fetchTitlesService = new FetchTitlesService();
  }

  public async handle(request: FastifyRequest<SignInRequest>, reply: FastifyReply) {
    this.fetchTitlesService.cnpj = request.user.cnpj;
    
    const account = await this.fetchTitlesService.execute();

    return reply.code(200).send({
      account,
    });
  }

}