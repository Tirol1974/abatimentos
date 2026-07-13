import { AccountRepository } from "../../repositories/Account-repository.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { RoleRepository } from "../../repositories/Role-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class AccountUpdateService {
  public account_id: number = 0;
  public name: string = "";
  public email: string = "";
  public cnpj_root: string = "";
  public role: string = "";

  private readonly accountRepository: AccountRepository;
  private readonly accountRoleRepository: AccountRoleRepository;
  private readonly roleRepository: RoleRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.accountRoleRepository = new AccountRoleRepository();
    this.roleRepository = new RoleRepository();
  }

  public async execute() {
    this.accountRepository.account_id = this.account_id;
    this.accountRepository.name = this.name;
    this.accountRepository.email = this.email;
    this.accountRepository.cnpj_root = this.cnpj_root;

    const accountExists = await this.accountRepository.findById();
    
    if (!accountExists) {
      throw new ApiError("Conta não encontrada", 400);
    }

    this.roleRepository.slug = this.role;

    const role = await this.roleRepository.findBySlug();

    if (!role) {
      throw new ApiError("Função não encontrada", 404);
    }

    this.accountRoleRepository.account_id = this.account_id;
    this.accountRoleRepository.role_id = role.id;

    const account_role = await this.accountRoleRepository.findByAccountId();

    if (!account_role) {
      throw new ApiError("Nenhuma função encontrada para essa conta", 400);
    }

    this.accountRoleRepository.account_role_id = account_role.id;

    await this.accountRepository.update();

    const {
      account,
    } = await this.accountRoleRepository.update();

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