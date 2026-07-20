import { compare } from "bcryptjs";
import { AccountRepository } from "../../repositories/Account-repository.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { LoginCodeRepository } from "../../repositories/LoginCode-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class VerifyCodeService {
  public email: string = "";
  public code: string = "";

  private readonly accountRepository: AccountRepository;
  private readonly accountRoleRepository: AccountRoleRepository;
  private readonly loginCodeRepository: LoginCodeRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.accountRoleRepository = new AccountRoleRepository();
    this.loginCodeRepository = new LoginCodeRepository();
  }

  public async execute() {
    this.accountRepository.email = this.email;

    const account = await this.accountRepository.findByEmail();

    if (!account) {
      throw new ApiError("Codigo invalido ou expirado", 400);
    }

    this.loginCodeRepository.account_id = account.id;

    const loginCode = await this.loginCodeRepository.findLastValidByAccountId();

    if (!loginCode) {
      throw new ApiError("Codigo invalido ou expirado", 400);
    }

    const isValidCode = await compare(this.code, loginCode.code_hash);

    if (!isValidCode) {
      throw new ApiError("Codigo invalido ou expirado", 400);
    }

    this.loginCodeRepository.login_code_id = loginCode.id;
    await this.loginCodeRepository.markAsUsed();

    this.accountRoleRepository.account_id = account.id;

    const accountRole = await this.accountRoleRepository.findByAccountId();

    if (!accountRole) {
      throw new ApiError("Nenhuma funcao foi encontrada para essa conta", 404);
    }

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: accountRole.role.slug,
      cnpj_root: account.cnpj_root,
      first_login: account.first_login,
      created_at: account.created_at,
      updated_at: account.updated_at
    };
  }
}
