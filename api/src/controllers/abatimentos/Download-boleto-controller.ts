import type { FastifyReply, FastifyRequest } from "fastify";
import { DownloadBoletoService } from "../../services/abatimentos/Download-boleto-service.js";

export type DownloadBoletoRequest = {
  Params: {
    abatimento_id: number
  }
}

export class DownloadBoletoController {
  private readonly downloadBoletoService: DownloadBoletoService;

  constructor() {
    this.downloadBoletoService = new DownloadBoletoService();
  }

  public async handle(request: FastifyRequest<DownloadBoletoRequest>, reply: FastifyReply) {
    const {
      abatimento_id
    } = request.params;

    this.downloadBoletoService.abatimento_id = Number(abatimento_id);
    this.downloadBoletoService.account_id = request.user.sub;
    this.downloadBoletoService.role = request.user.role;

    const boleto = await this.downloadBoletoService.execute();

    return reply
      .header("Content-Type", "application/pdf")
      .header("Content-Disposition", `attachment; filename="${boleto.file_name}"`)
      .send(boleto.file);
  }
}
