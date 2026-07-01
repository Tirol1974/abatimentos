import { AccountInfoRepository } from "../../repositories/AccountInfo-repository.js";

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

    console.log(this.cnpjs);

    const account = await this.accountInfoRepository.create();

    return account;
  }
}