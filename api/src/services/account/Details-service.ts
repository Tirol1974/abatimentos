import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class AccountDetailsService {
  public account_id: number = 0;
  private readonly accountRoleRepository: AccountRoleRepository;

  constructor() {
    this.accountRoleRepository = new AccountRoleRepository();
  }

  public async execute() {
    this.accountRoleRepository.account_id = this.account_id;

    const dbData = await this.accountRoleRepository.findByAccountId();

    if (!dbData) {
      throw new ApiError("Conta não encontrada", 400);
    }

    const {
      account,
      role
    } = dbData;

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: role.slug,
      first_login: account.first_login,
      cnpj_root: account.cnpj_root,
      created_at: account.created_at,
      updated_at: account.updated_at,
    }
  }
}