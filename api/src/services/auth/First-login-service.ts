import { AccountRepository } from "../../repositories/Account-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { CreateAccountService } from "../account/Create-service.js";

type SapBpCheckApiResponse = {
  message: string
  name: string
  email: string
  cnpjRoot: string
}

type SapApiErrorResponse = {
  status: number
  message: string
}

export class FirstLoginService {
  public email: string = "";

  private readonly accountRepository: AccountRepository;
  private readonly basicS4Auth: string = "";

  constructor() {
    this.basicS4Auth = Buffer.from(`${process.env.SAP_USER}:${process.env.SAP_USER_PWD}`).toString('base64');
    this.accountRepository = new AccountRepository();
  }

  public async execute() {
    this.accountRepository.email = this.email;

    const account = await this.accountRepository.findByEmail();

    if (account) {
      throw new ApiError("Já existe uma conta com esse e-mail cadastrada", 404);
    }

    const params = new URLSearchParams({
      "sap-client": `${process.env.SAP_CLIENT}`,
    });

    const request = await fetch(`${process.env.SAP_API_URL}/portal-abatimentos/primeiro-acesso?${params}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${this.basicS4Auth}`,
      },
      body: JSON.stringify({
        email: this.email
      }),
    });

    if (!request.ok) {
      const {
        message,
        status
      } = await request.json() as SapApiErrorResponse;
      throw new ApiError(message, status);
    }

    const response = await request.json() as SapBpCheckApiResponse;

    const createAccountService = new CreateAccountService();

    createAccountService.name = response.name;
    createAccountService.email = response.email;
    createAccountService.cnpj_root = response.cnpjRoot;
    createAccountService.role = "cliente";

    await createAccountService.execute();
  }
}