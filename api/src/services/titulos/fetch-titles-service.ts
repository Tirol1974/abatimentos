import { ApiError } from "../../utils/ApiError.js";

type SapTitleProps = {
  kunnr: string,
  belnr: string,
  budat: string,
  zfbdt: string,
  zbd1t: number,
  dmbtr: number,
  wrbtr: number,
  xblnr: string,
  zuonr: string,
  sgtxt: string
}

type SapSuccessApiResponse = SapTitleProps[]

export class FetchTitlesService {  
  public cnpj: string = "";
  private readonly basicS4Auth: string = "";

  constructor() {
    this.basicS4Auth = Buffer.from(`${process.env.SAP_USER}:${process.env.SAP_USER_PWD}`).toString('base64');
  }

  public async execute() {
    const params = new URLSearchParams({
      "sap-client": `${process.env.SAP_CLIENT}`,
      "cnpj": this.cnpj,
    });

    const request = await fetch(`${process.env.SAP_API_URL}/abatimentos/titulos?${params}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${this.basicS4Auth}`,
      },
    });

    if (!request.ok) {
      throw new ApiError("Houve um erro ao buscar os títulos do SAP", 500);
    }

    const response = await request.json() as SapTitleProps[];

    return response;
  }
}