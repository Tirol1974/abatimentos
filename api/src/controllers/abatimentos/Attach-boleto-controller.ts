import type { FastifyReply, FastifyRequest } from "fastify";
import { AttachBoletoService } from "../../services/abatimentos/Attach-boleto-service.js";

type AttachBoletoData = {
  file_name: string;
  boleto_base64: string;
}

export type AttachBoletoRequest = {
  Params: {
    abatimento_id: number
  },
  Body: AttachBoletoData
}

export class AttachBoletoController {
  private readonly attachBoletoService: AttachBoletoService;

  constructor() {
    this.attachBoletoService = new AttachBoletoService();
  }

  public async handle(request: FastifyRequest<AttachBoletoRequest>, reply: FastifyReply) {
    const {
      abatimento_id
    } = request.params;

    const {
      file_name,
      boleto_base64
    } = request.body;

    this.attachBoletoService.abatimento_id = Number(abatimento_id);
    this.attachBoletoService.file_name = file_name;
    this.attachBoletoService.boleto_base64 = boleto_base64;

    const abatimento = await this.attachBoletoService.execute();

    return reply.code(200).send({
      abatimento,
    });
  }
}
