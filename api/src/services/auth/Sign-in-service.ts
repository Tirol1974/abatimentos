import { compare } from "bcryptjs";
import { AccountRepository } from "../../repositories/Account-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";

export class SignInService {
  public email: string = "";
  public password: string = "";

  private readonly accountRepository: AccountRepository;
  private readonly accountRoleRepository: AccountRoleRepository;
  
  constructor() {
    this.accountRepository = new AccountRepository();
    this.accountRoleRepository = new AccountRoleRepository();
  }

  public async execute() {
    this.accountRepository.email = this.email;
    this.accountRepository.password = this.password;

    const account = await this.accountRepository.findByEmail();

    if (!account) {
      throw new ApiError("E-mail ou senha invalidos", 404);
    }

    let hashed_password = await compare(this.password, account.password);

    if (!hashed_password) {
      throw new ApiError("E-mail ou senha invalidos", 404);
    }

    this.accountRoleRepository.account_id = account.id;

    const accountRole = await this.accountRoleRepository.findByAccountId();

    if (!accountRole) {
      throw new ApiError("Nenhuma função foi encontrada para essa conta", 404);
    }

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: accountRole.role.slug,
      first_login: accountRole.account.first_login,
      created_at: account.created_at,
      updated_at: account.updated_at
    };
  }
}
