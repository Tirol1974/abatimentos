import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { NotifyAbatimentoService } from "./Notify-abatimento-service.js";

type PartidaAbatimento = {
  valor: number;
}

export class CreateAbatimentoService {
  public account_id: number = 0;
  public devolucoes: PartidaAbatimento[] = [];
  public vendas: PartidaAbatimento[] = [];

  private readonly abatimentosRepository: AbatimentosRepository;
  private readonly notifyAbatimentoService: NotifyAbatimentoService;

  constructor() {
    this.abatimentosRepository = new AbatimentosRepository();
    this.notifyAbatimentoService = new NotifyAbatimentoService();
  }

  public async execute() {
    if (this.devolucoes.length == 0) {
      throw new ApiError("Selecione ao menos uma devolucao para abater", 400);
    }

    if (this.vendas.length == 0) {
      throw new ApiError("Selecione ao menos uma venda para receber o abatimento", 400);
    }

    const totalDevolucoes = this.devolucoes.reduce((total, partida) => total + partida.valor, 0);
    const totalVendas = this.vendas.reduce((total, partida) => total + partida.valor, 0);

    if ((totalVendas * -1) < totalDevolucoes) {
      throw new ApiError("O saldo selecionado precisa ser maior ou igual ao total de abatimentos", 400);
    }

    this.abatimentosRepository.account_id = this.account_id;
    this.abatimentosRepository.devolucoes = this.devolucoes;
    this.abatimentosRepository.vendas = this.vendas;

    const abatimento = await this.abatimentosRepository.create();

    await this.notifyAbatimentoService.notifySolicitado({
      id: abatimento.id,
      devolucoes: abatimento.devolucoes,
      vendas: abatimento.vendas,
      account_id: abatimento.account_id,
    });

    return {
      id: abatimento.id,
      devolucoes: abatimento.devolucoes,
      vendas: abatimento.vendas,
      status: abatimento.status,
      total_devolucoes: totalDevolucoes,
      total_vendas: totalVendas,
      boleto_file_name: null,
      boleto_uploaded_at: null,
      boleto_download_url: null,
      created_at: abatimento.created_at,
      updated_at: abatimento.updated_at,
    };
  }
}
