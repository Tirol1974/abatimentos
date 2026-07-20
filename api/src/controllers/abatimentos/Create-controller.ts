import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateAbatimentoService } from "../../services/abatimentos/Create-service.js";

type PartidaAbatimento = {
  id: string;
  tipo: string;
  blart: string;
  doc: string;
  parcela: number;
  dataDocumento: string;
  dataVencimento: string;
  valor: number;
  referencia: string;
  descricao: string;
}

type CreateAbatimentoData = {
  devolucoes: PartidaAbatimento[];
  vendas: PartidaAbatimento[];
}

export type CreateAbatimentoRequest = {
  Body: CreateAbatimentoData
}

export class CreateAbatimentoController {
  private readonly createAabatimentoService: CreateAbatimentoService;
  
  constructor() {
    this.createAabatimentoService = new CreateAbatimentoService();
  }

  public async handle(request: FastifyRequest<CreateAbatimentoRequest>, reply: FastifyReply) {
    const {
      devolucoes,
      vendas
    } = request.body;

    this.createAabatimentoService.account_id = request.user.sub;
    this.createAabatimentoService.devolucoes = devolucoes;
    this.createAabatimentoService.vendas = vendas;

    const abatimento = await this.createAabatimentoService.execute();

    return reply.code(201).send({
      abatimento,
    });
  }
}
