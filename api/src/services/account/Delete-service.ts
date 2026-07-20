import { AccountRepository } from "../../repositories/Account-repository.js";
import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class AccountDeleteService {
  public account_id: number = 0;

  private readonly accountRepository: AccountRepository;
  private readonly abatimentosRepository: AbatimentosRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.abatimentosRepository = new AbatimentosRepository();
  }

  public async execute() {
    this.accountRepository.account_id = this.account_id;

    const accountExists = await this.accountRepository.findById();

    if (!accountExists) {
      throw new ApiError("Conta nao encontrada", 400);
    }

    this.abatimentosRepository.account_id = this.account_id;

    const totalAbatimentos = await this.abatimentosRepository.countByAccountId();

    if (totalAbatimentos > 0) {
      throw new ApiError("Nao e possivel deletar uma conta com abatimentos vinculados", 400);
    }

    await this.accountRepository.deleteById();
  }
}
