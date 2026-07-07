import { AccountInfoRepository } from "../../repositories/AccountInfo-repository.js";

export class ListCNPJSService {
  public account_id: number = 0;

  private readonly accountInfoRepository: AccountInfoRepository;
  
  constructor() {
    this.accountInfoRepository = new AccountInfoRepository();
  }

  public async execute() {
    this.accountInfoRepository.account_id = this.account_id;

    const accountCNPJs = await this.accountInfoRepository.listAccountInfo();

    return accountCNPJs;
  }
}