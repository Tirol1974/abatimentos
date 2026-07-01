import { AccountRepository } from "../../repositories/Account-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class ChangeFirstLoginService {
  public account_id: number = 0;
  private readonly accountRepository: AccountRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  public async execute() {
    this.accountRepository.account_id = this.account_id;

    const account = await this.accountRepository.findById();

    if (!account) {
      throw new ApiError("Conta não encontrada", 500);
    }

    const updated_account = await this.accountRepository.changeFirstLogin();

    return updated_account;
  }
}