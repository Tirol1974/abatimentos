import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class MeService {
  public account_id: number = 0;
  private readonly accountRoleRepository: AccountRoleRepository;
  
  constructor() {
    this.accountRoleRepository = new AccountRoleRepository();
  }

  public async execute() {
    this.accountRoleRepository.account_id = this.account_id;

    const accountRole = await this.accountRoleRepository.findByAccountId();

    if (!accountRole) {
      throw new ApiError("Nenhuma função foi encontrada para essa conta", 404);
    }

    return {
      id: accountRole.account.id,
      name: accountRole.account.name,
      email: accountRole.account.email,
      role: accountRole.role.slug,
      first_login: accountRole.account.first_login,
      created_at: accountRole.account.created_at,
      updated_at: accountRole.account.updated_at
    };
  }  
}
