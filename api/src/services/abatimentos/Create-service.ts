import { prisma } from "../../infra/prisma/index.js";
import {
  AbatimentoCreditosUtilizadosRepository,
  type AbatimentoCreditoUtilizadoInput,
} from "../../repositories/Abatimento-creditos-utilizados-repository.js";
import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import type { PartidaAbatimento } from "./Normalize-partidas.js";
import { NotifyAbatimentoService } from "./Notify-abatimento-service.js";

export class CreateAbatimentoService {
  public account_id: number = 0;
  public devolucoes: PartidaAbatimento[] = [];
  public vendas: PartidaAbatimento[] = [];

  private readonly notifyAbatimentoService: NotifyAbatimentoService;

  constructor() {
    this.notifyAbatimentoService = new NotifyAbatimentoService();
  }

  public async execute() {
    if (this.devolucoes.length == 0) {
      throw new ApiError("Selecione ao menos uma devolucao para abater", 400);
    }

    if (this.vendas.length == 0) {
      throw new ApiError("Selecione ao menos uma venda para receber o abatimento", 400);
    }

    const totalVendas = this.vendas.reduce((total, partida) => total + partida.valor, 0);
    const totalVendasParaAbater = totalVendas * -1;

    if (totalVendasParaAbater <= 0) {
      throw new ApiError("Selecione ao menos uma venda com saldo para abater", 400);
    }

    const creditosUtilizadosRepository = new AbatimentoCreditosUtilizadosRepository();
    creditosUtilizadosRepository.account_id = this.account_id;

    const creditosJaUtilizados = await creditosUtilizadosRepository.listByAccountId();
    const creditosUtilizados = this.getCreditosUtilizados(creditosJaUtilizados);

    if (creditosUtilizados.devolucoes.length == 0) {
      throw new ApiError("Selecione ao menos uma devolucao disponivel para abater", 400);
    }

    if (totalVendasParaAbater < creditosUtilizados.totalUtilizado) {
      throw new ApiError("O saldo selecionado precisa ser maior ou igual ao total de abatimentos", 400);
    }

    const abatimento = await prisma.$transaction(async (transaction) => {
      const abatimentosRepository = new AbatimentosRepository(transaction);

      abatimentosRepository.account_id = this.account_id;
      abatimentosRepository.devolucoes = creditosUtilizados.devolucoes;
      abatimentosRepository.vendas = this.vendas;

      const abatimento = await abatimentosRepository.create();

      const creditosUtilizadosRepository = new AbatimentoCreditosUtilizadosRepository(transaction);
      creditosUtilizadosRepository.creditos = creditosUtilizados.creditos.map((credito) => ({
        ...credito,
        abatimento_id: abatimento.id,
      }));

      await creditosUtilizadosRepository.createMany();

      return abatimento;
    });

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
      total_devolucoes: creditosUtilizados.totalUtilizado,
      total_vendas: totalVendas,
      boleto_file_name: null,
      boleto_uploaded_at: null,
      boleto_download_url: null,
      created_at: abatimento.created_at,
      updated_at: abatimento.updated_at,
    };
  }

  private getCreditosUtilizados(
    creditosJaUtilizados: { doc: string; parcela: number; blart: string; referencia: string; valor_utilizado: number }[]
  ) {
    const partidasJaUtilizadas = this.getPartidasJaUtilizadas(creditosJaUtilizados);
    const devolucoes: PartidaAbatimento[] = [];
    const creditos: Omit<AbatimentoCreditoUtilizadoInput, "abatimento_id">[] = [];

    for (const partida of this.devolucoes) {
      if (!this.isCredito(partida)) {
        continue;
      }

      const chave = this.getPartidaKey(partida);
      
      if (partidasJaUtilizadas.has(chave)) {
        throw new ApiError("Uma das devolucoes selecionadas ja foi utilizada em outro abatimento", 400);
      }

      devolucoes.push(partida);

      creditos.push({
        account_id: this.account_id,
        doc: partida.doc ?? "",
        parcela: partida.parcela ?? 0,
        tipo: partida.tipo ?? "",
        blart: partida.blart ?? "",
        referencia: partida.referencia ?? "",
        valor_original: partida.valor,
        valor_utilizado: partida.valor,
      });
    }

    return {
      devolucoes,
      creditos,
      totalUtilizado: devolucoes.reduce((total, partida) => total + partida.valor, 0),
    };
  }

  private getPartidasJaUtilizadas(
    creditosJaUtilizados: { doc: string; parcela: number; blart: string; referencia: string; valor_utilizado: number }[]
  ) {
    const partidasJaUtilizadas = new Set<string>();

    for (const credito of creditosJaUtilizados) {
      partidasJaUtilizadas.add(this.getPartidaKey(credito));
    }

    return partidasJaUtilizadas;
  }

  private isCredito(partida: PartidaAbatimento) {
    return (
      partida.valor > 0 &&
      ["RV", "SA", "DA"].includes(partida.blart ?? "")
    );
  }

  private getPartidaKey(partida: { doc?: string; parcela?: number; blart?: string; referencia?: string }) {
    return [
      partida.doc ?? "",
      partida.parcela ?? 0,
      partida.blart ?? "",
      partida.referencia ?? "",
    ].join("|");
  }
}
