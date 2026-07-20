import type { FastifyReply, FastifyRequest } from "fastify";
import { ChangeAbatimentoStatusService } from "../../services/abatimentos/Change-status-service.js";

type ChangeAbatimentoStatusData = {
  status: "solicitado" | "atendimento" | "finalizado";
}

export type ChangeAbatimentoStatusRequest = {
  Params: {
    abatimento_id: number
  },
  Body: ChangeAbatimentoStatusData
}

export class ChangeAbatimentoStatusController {
  private readonly changeAbatimentoStatusService: ChangeAbatimentoStatusService;

  constructor() {
    this.changeAbatimentoStatusService = new ChangeAbatimentoStatusService();
  }

  public async handle(request: FastifyRequest<ChangeAbatimentoStatusRequest>, reply: FastifyReply) {
    const {
      abatimento_id
    } = request.params;

    const {
      status
    } = request.body;

    this.changeAbatimentoStatusService.abatimento_id = Number(abatimento_id);
    this.changeAbatimentoStatusService.status = status;

    const abatimento = await this.changeAbatimentoStatusService.execute();

    return reply.code(200).send({
      abatimento,
    });
  }
}
