import type { FastifyReply, FastifyRequest } from "fastify";
import { MetricsAdminAbatimentosService } from "../../services/abatimentos/Metrics-admin-service.js";

type MetricsAdminAbatimentosQuery = {
  month?: string;
}

export type MetricsAdminAbatimentosRequest = {
  Querystring: MetricsAdminAbatimentosQuery
}

export class MetricsAdminAbatimentosController {
  private readonly metricsAdminAbatimentosService: MetricsAdminAbatimentosService;

  constructor() {
    this.metricsAdminAbatimentosService = new MetricsAdminAbatimentosService();
  }

  public async handle(request: FastifyRequest<MetricsAdminAbatimentosRequest>, reply: FastifyReply) {
    const {
      month
    } = request.query;

    this.metricsAdminAbatimentosService.month = month ?? "";

    const metrics = await this.metricsAdminAbatimentosService.execute();

    return reply.code(200).send(metrics);
  }
}
