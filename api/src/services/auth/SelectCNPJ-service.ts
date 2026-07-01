import { AccountRepository } from "../../repositories/Account-repository.js";
import { AccountInfoRepository } from "../../repositories/AccountInfo-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class SelectCNPJService {
  public cnpj: string = "";
  public account_id: number = 0;

  private readonly accountInfoRepository: AccountInfoRepository;
  private readonly accountRepository: AccountRepository;
  
  constructor() {
    this.accountInfoRepository = new AccountInfoRepository();
    this.accountRepository = new AccountRepository();
  }

  public async execute() {
    this.accountInfoRepository.account_id = this.account_id;
    this.accountInfoRepository.cnpjs = [ this.cnpj ];
    this.accountRepository.account_id = this.account_id;

    const accountDetails = await this.accountRepository.findById();

    if (!accountDetails) {
      throw new ApiError("Conta invalida ou não encontrada", 404);
    }

    const accountInfo = await this.accountInfoRepository.selectAccountInfoByIDAndCNPJ();

    return accountInfo;
  }  
}
