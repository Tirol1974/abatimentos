import { AccountRepository } from "../../repositories/Account-repository.js";
import { AccountInfoRepository } from "../../repositories/AccountInfo-repository.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class MeService {
  public account_id: number = 0;
  public cnpj: string = "";
  private readonly accountRepository: AccountRepository;
  private readonly accountInfoRepository: AccountInfoRepository;
  private readonly accountRoleRepository: AccountRoleRepository;
  
  constructor() {
    this.accountRepository = new AccountRepository();
    this.accountInfoRepository = new AccountInfoRepository();
    this.accountRoleRepository = new AccountRoleRepository();
  }

  public async execute() {
    this.accountRoleRepository.account_id = this.account_id;

    this.accountInfoRepository.account_id = this.account_id;
    this.accountInfoRepository.cnpjs = [ this.cnpj ];

    const accountInfo = await this.accountInfoRepository.selectAccountInfoByIDAndCNPJ();

    if (accountInfo) {
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

    this.accountRepository.account_id = this.account_id;

    const account_data = await this.accountRepository.findById();

    if (!account_data) {
      throw new ApiError("Nenhuma conta foi encontrada", 500);
    }

    const accountRole = await this.accountRoleRepository.findByAccountId();

    if (!accountRole) {
      throw new ApiError("Nenhuma função foi encontrada para essa conta", 404);
    }

    return {
      id: account_data.id,
      name: account_data.name,
      email: account_data.email,
      role: accountRole.role.slug,
      cnpj: "",
      first_login: accountRole.account.first_login,
      created_at: account_data.created_at,
      updated_at: account_data.updated_at
    };
  }  
}
