import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { normalizePartidas } from "./Normalize-partidas.js";

export class ListAbatimentosService {
  public account_id: number = 0;

  private readonly abatimentosRepository: AbatimentosRepository;

  constructor() {
    this.abatimentosRepository = new AbatimentosRepository();
  }

  public async execute() {
    this.abatimentosRepository.account_id = this.account_id;
    this.abatimentosRepository.own = true;

    const abatimentos = await this.abatimentosRepository.list();

    return abatimentos.map((abatimento) => {
      const boleto = abatimento as typeof abatimento & {
        boleto_path: string | null;
        boleto_file_name: string | null;
        boleto_uploaded_at: Date | null;
      };
      const devolucoes = normalizePartidas(abatimento.devolucoes);
      const vendas = normalizePartidas(abatimento.vendas);

      return {
        id: abatimento.id,
        devolucoes,
        vendas,
        status: abatimento.status,
        total_devolucoes: devolucoes.reduce((total, partida) => total + partida.valor, 0),
        total_vendas: vendas.reduce((total, partida) => total + partida.valor, 0),
        boleto_file_name: boleto.boleto_file_name,
        boleto_uploaded_at: boleto.boleto_uploaded_at,
        boleto_download_url: boleto.boleto_path ? `/abatimentos/${abatimento.id}/boleto` : null,
        created_at: abatimento.created_at,
        updated_at: abatimento.updated_at,
      };
    });
  }
}
