import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { normalizePartidas } from "./Normalize-partidas.js";

export class MetricsAdminAbatimentosService {
  public month: string = "";

  private readonly abatimentosRepository: AbatimentosRepository;

  constructor() {
    this.abatimentosRepository = new AbatimentosRepository();
  }

  public async execute() {
    const {
      startDate,
      endDate,
      month,
    } = this.getPeriod();

    this.abatimentosRepository.date_start = startDate;
    this.abatimentosRepository.date_end = endDate;

    const abatimentos = await this.abatimentosRepository.listMetricsByPeriod();

    const requestedAbatimentos = abatimentos.filter((abatimento) => (
      abatimento.created_at >= startDate &&
      abatimento.created_at < endDate
    ));

    const finishedAbatimentos = abatimentos.filter((abatimento) => (
      abatimento.status == "finalizado" &&
      abatimento.boleto_uploaded_at != null &&
      abatimento.boleto_uploaded_at >= startDate &&
      abatimento.boleto_uploaded_at < endDate
    ));

    const totalResolutionHours = finishedAbatimentos.reduce((total, abatimento) => {
      const boletoUploadedAt = abatimento.boleto_uploaded_at;

      if (!boletoUploadedAt) {
        return total;
      }

      return total + ((boletoUploadedAt.getTime() - abatimento.created_at.getTime()) / 1000 / 60 / 60);
    }, 0);

    return {
      month,
      total_requested: requestedAbatimentos.length,
      total_finished: finishedAbatimentos.length,
      total_in_progress: requestedAbatimentos.filter((abatimento) => abatimento.status == "atendimento").length,
      total_pending: requestedAbatimentos.filter((abatimento) => abatimento.status == "solicitado").length,
      amount_requested: this.sumDevolucoes(requestedAbatimentos),
      amount_finished: this.sumDevolucoes(finishedAbatimentos),
      average_resolution_hours: finishedAbatimentos.length > 0
        ? Number((totalResolutionHours / finishedAbatimentos.length).toFixed(2))
        : 0,
    };
  }

  private getPeriod() {
    const now = new Date();
    const month = this.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const monthMatch = /^(\d{4})-(\d{2})$/.exec(month);

    if (!monthMatch) {
      throw new ApiError("Informe o mes no formato YYYY-MM", 400);
    }

    const year = Number(monthMatch[1]);
    const monthIndex = Number(monthMatch[2]) - 1;

    if (monthIndex < 0 || monthIndex > 11) {
      throw new ApiError("Informe um mes valido", 400);
    }

    return {
      month,
      startDate: new Date(year, monthIndex, 1),
      endDate: new Date(year, monthIndex + 1, 1),
    };
  }

  private sumDevolucoes(abatimentos: { devolucoes: unknown }[]) {
    return abatimentos.reduce((total, abatimento) => {
      const devolucoes = normalizePartidas(abatimento.devolucoes);

      return total + devolucoes.reduce((subtotal, partida) => subtotal + partida.valor, 0);
    }, 0);
  }
}
