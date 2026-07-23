import type { FastifyReply, FastifyRequest } from "fastify";
import { UpdateSettingsService } from "../../services/settings/Update-service.js";

type UpdateSettingsBody = {
  devolucao_days_back: number;
  venda_days_forward: number;
  abatimentos_mail_to: string;
}

export type UpdateSettingsRequest = {
  Body: UpdateSettingsBody
}

export class UpdateSettingsController {
  private readonly updateSettingsService: UpdateSettingsService;

  constructor() {
    this.updateSettingsService = new UpdateSettingsService();
  }

  public async handle(request: FastifyRequest<UpdateSettingsRequest>, reply: FastifyReply) {
    const {
      devolucao_days_back,
      venda_days_forward,
      abatimentos_mail_to,
    } = request.body;

    this.updateSettingsService.devolucao_days_back = devolucao_days_back;
    this.updateSettingsService.venda_days_forward = venda_days_forward;
    this.updateSettingsService.abatimentos_mail_to = abatimentos_mail_to;

    const settings = await this.updateSettingsService.execute();

    return reply.code(200).send({
      settings
    });
  }
}
