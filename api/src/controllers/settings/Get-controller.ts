import type { FastifyReply, FastifyRequest } from "fastify";
import { GetSettingsService } from "../../services/settings/Get-service.js";

export class GetSettingsController {
  private readonly getSettingsService: GetSettingsService;

  constructor() {
    this.getSettingsService = new GetSettingsService();
  }

  public async handle(request: FastifyRequest, reply: FastifyReply) {
    const settings = await this.getSettingsService.execute();

    return reply.code(200).send({
      settings
    });
  }
}
