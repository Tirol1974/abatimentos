import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { NotifyAbatimentoService } from "./Notify-abatimento-service.js";

type AbatimentoStatus = "solicitado" | "atendimento" | "finalizado";

export class ChangeAbatimentoStatusService {
  public abatimento_id: number = 0;
  public status: AbatimentoStatus = "solicitado";

  private readonly abatimentosRepository: AbatimentosRepository;
  private readonly notifyAbatimentoService: NotifyAbatimentoService;

  constructor() {
    this.abatimentosRepository = new AbatimentosRepository();
    this.notifyAbatimentoService = new NotifyAbatimentoService();
  }

  public async execute() {
    this.abatimentosRepository.abatimento_id = this.abatimento_id;

    const abatimento = await this.abatimentosRepository.findById();

    if (!abatimento) {
      throw new ApiError("Abatimento nao encontrado", 400);
    }

    if (abatimento.status == "finalizado") {
      throw new ApiError("Nao e possivel alterar um abatimento finalizado", 400);
    }

    if (this.status == "finalizado") {
      throw new ApiError("Finalize o abatimento anexando o boleto", 400);
    }

    this.abatimentosRepository.status = this.status;

    const updatedAbatimento = await this.abatimentosRepository.changeStatus();

    if (this.status == "atendimento") {
      await this.notifyAbatimentoService.notifyAtendimento({
        id: updatedAbatimento.id,
        devolucoes: updatedAbatimento.devolucoes,
        vendas: updatedAbatimento.vendas,
        account_id: updatedAbatimento.account_id,
      });
    }

    return updatedAbatimento;
  }
}
