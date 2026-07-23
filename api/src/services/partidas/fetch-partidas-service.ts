import { ApiError } from "../../utils/ApiError.js";
import { SettingsRepository } from "../../repositories/Settings-repository.js";
import type { SapClientProps } from "../account/ListCNPJS-service.js";

type Resume = {
  totalAPagar: number,
  totalAReceberSa: number,
  totalAReceberRv: number,
}

type SapPartidasProps = {
  id: string,
  tipo: string,
  blart: string,
  doc: string,
  parcela: number,
  dataDocumento: string,
  dataVencimento: string,
  valor: number,
  referencia: string,
  descricao: string,
}

type SapApiSuccessResponse = {
  resumo: Resume,
  partidas: SapPartidasProps[]
}

export class FetchSapPartidasService {  
  public kunnr_list: SapClientProps[] = [];
  public doc_type: string[] = [""];
  private readonly basicS4Auth: string = "";
  private readonly settingsRepository: SettingsRepository;

  constructor() {
    this.basicS4Auth = Buffer.from(`${process.env.SAP_USER}:${process.env.SAP_USER_PWD}`).toString('base64');
    this.settingsRepository = new SettingsRepository();
  }

  public async execute() {
    const settings = await this.settingsRepository.get();
    const params = new URLSearchParams({
      "sap-client": `${process.env.SAP_CLIENT}`,
    });

    const request = await fetch(`${process.env.SAP_API_URL}/partidas-em-aberto?${params}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${this.basicS4Auth}`,
      },
      body: JSON.stringify({
        kunnr_list: this.kunnr_list
      }),
    });

    if (!request.ok) {
      throw new ApiError("Houve um erro ao buscar as partidas do SAP", 500);
    }

    const response = await request.json() as SapApiSuccessResponse;

    if (this.doc_type.length == 0) {
      const partidas = response.partidas.filter((partida) => this.matchesBackofficeDateRules(
        partida,
        settings.devolucao_days_back,
        settings.venda_days_forward
      ));

      return {
        resumo: this.getResumo(partidas),
        partidas,
      };
    } else {
      let partidas_filtradas: SapPartidasProps[] = [];
      let total_a_receber_sa: number = 0;
      let total_a_receber_rv: number = 0;
      
      partidas_filtradas = response.partidas
        .filter((prev) => this.doc_type.includes(prev.blart))
        .filter((partida) => this.matchesBackofficeDateRules(
          partida,
          settings.devolucao_days_back,
          settings.venda_days_forward
        ));
      
      if (this.doc_type.includes("SA") || this.doc_type.includes("DA")) {
        total_a_receber_sa = partidas_filtradas.reduce((prev, partida) => {
          return prev + partida.valor;
        }, 0);
      } else {
        total_a_receber_rv = partidas_filtradas.reduce((prev, partida) => {
          return prev + partida.valor;
        }, 0);
      }

      return {
        resumo: this.getResumo(partidas_filtradas),
        partidas: partidas_filtradas
      };
    }
  }

  private getResumo(partidas: SapPartidasProps[]): Resume {
    return {
      totalAPagar: partidas
        .filter((partida) => partida.valor < 0)
        .reduce((total, partida) => total + partida.valor, 0),
      totalAReceberSa: partidas
        .filter((partida) => ["SA", "DA"].includes(partida.blart))
        .reduce((total, partida) => total + partida.valor, 0),
      totalAReceberRv: partidas
        .filter((partida) => partida.blart == "RV" && partida.valor > 0)
        .reduce((total, partida) => total + partida.valor, 0),
    };
  }

  private matchesBackofficeDateRules(
    partida: SapPartidasProps,
    devolucaoDaysBack: number,
    vendaDaysForward: number
  ) {
    if (partida.blart == "RV" && partida.valor > 0) {
      const dataDocumento = this.parseSapDate(partida.dataDocumento);

      if (!dataDocumento) {
        return true;
      }

      return dataDocumento >= this.addDays(this.startOfToday(), devolucaoDaysBack * -1);
    }

    if (partida.valor < 0) {
      const dataVencimento = this.parseSapDate(partida.dataVencimento);

      if (!dataVencimento) {
        return true;
      }

      return dataVencimento >= this.addDays(this.startOfToday(), vendaDaysForward);
    }

    return true;
  }

  private parseSapDate(value: string) {
    if (!value) {
      return null;
    }

    const normalizedValue = value.trim();
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedValue);
    const brMatch = /^(\d{2})[./-](\d{2})[./-](\d{4})$/.exec(normalizedValue);
    const abapMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(normalizedValue);

    if (isoMatch) {
      return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }

    if (brMatch) {
      return new Date(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1]));
    }

    if (abapMatch) {
      return new Date(Number(abapMatch[1]), Number(abapMatch[2]) - 1, Number(abapMatch[3]));
    }

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private startOfToday() {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  private addDays(date: Date, days: number) {
    const nextDate = new Date(date);

    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
  }
}
