import { AccountRepository } from "../../repositories/Account-repository.js";
import { AccountInfoRepository } from "../../repositories/AccountInfo-repository.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class SelectCNPJService {
  public cnpj: string = "";
  public account_id: number = 0;

  private readonly accountInfoRepository: AccountInfoRepository;
  private readonly accountRepository: AccountRepository;
  private readonly accountRoleRepository: AccountRoleRepository;
  
  constructor() {
    this.accountInfoRepository = new AccountInfoRepository();
    this.accountRepository = new AccountRepository();
    this.accountRoleRepository = new AccountRoleRepository();
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

    if (!accountInfo) {
      throw new ApiError("Nenhum CNPJ foi encontrado para essa conta", 404);
    }

    this.accountRoleRepository.account_id = accountInfo.account.id;

    const accountRole = await this.accountRoleRepository.findByAccountId();

    if (!accountRole) {
      throw new ApiError("Nenhuma função foi encontrada para essa conta", 404);
    }

    return {
      id: accountInfo.account.id,
      name: accountInfo.account.name,
      email: accountInfo.account.email,
      role: accountRole.role.slug,
      cnpj: accountInfo.cnpj,
      first_login: accountRole.account.first_login,
      created_at: accountInfo.account.created_at,
      updated_at: accountInfo.account.updated_at
    };
  }  
}
