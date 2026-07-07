import { AccountInfoRepository } from "../../repositories/AccountInfo-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class AccountAddCnpjsService {
  public cnpjs: string[] = [];
  public account_id: number = 0;

  private readonly accountInfoRepository: AccountInfoRepository;
  
  constructor() {
    this.accountInfoRepository = new AccountInfoRepository();
  }

  public async execute() {
    this.accountInfoRepository.cnpjs = this.cnpjs;
    this.accountInfoRepository.account_id = this.account_id;

    const cnpj_exists = await this.accountInfoRepository.selectAccountInfoByIDAndCNPJ();

    if (cnpj_exists) {
      throw new ApiError("Esse CNPJ já foi cadastrado", 404);
    }

    const account = await this.accountInfoRepository.create();

    return account;
  }
}