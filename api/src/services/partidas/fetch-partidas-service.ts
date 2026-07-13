import { ApiError } from "../../utils/ApiError.js";
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

  constructor() {
    this.basicS4Auth = Buffer.from(`${process.env.SAP_USER}:${process.env.SAP_USER_PWD}`).toString('base64');
  }

  public async execute() {
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
      return response;
    } else {
      let partidas_filtradas: SapPartidasProps[] = [];
      let total_a_receber_sa: number = 0;
      let total_a_receber_rv: number = 0;
      
      partidas_filtradas = response.partidas.filter((prev) => this.doc_type.includes(prev.blart));
      
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
        resumo: response.resumo,
        partidas: partidas_filtradas
      };
    }
  }
}
