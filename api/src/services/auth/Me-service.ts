import { AccountRepository } from "../../repositories/Account-repository.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class MeService {
  public account_id: number = 0;
  private readonly accountRepository: AccountRepository;
  private readonly accountRoleRepository: AccountRoleRepository;
  
  constructor() {
    this.accountRepository = new AccountRepository();
    this.accountRoleRepository = new AccountRoleRepository();
  }

  public async execute() {
    this.accountRoleRepository.account_id = this.account_id;

    this.accountRepository.account_id = this.account_id;

    const account = await this.accountRepository.findById();

    if (!account) {
      throw new ApiError("Nenhuma conta foi encontrada", 500);
    }

    const accountRole = await this.accountRoleRepository.findByAccountId();

    if (!accountRole) {
      throw new ApiError("Nenhuma função foi encontrada para essa conta", 404);
    }

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: accountRole.role.slug,
      cnpj_root: account.cnpj_root,
      first_login: accountRole.account.first_login,
      created_at: account.created_at,
      updated_at: account.updated_at
    };
  }  
}
