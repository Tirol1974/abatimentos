import { randomInt } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { AccountRepository } from "../../repositories/Account-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { LoginCodeRepository } from "../../repositories/LoginCode-repository.js";
import { SendEmailService } from "../email/send-email-service.js";

export class SignInService {
  public email: string = "";
  public password: string = "";

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

    const code = this.generateCode();
    const expiresInMinutes = 5;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    this.loginCodeRepository.account_id = account.id;
    await this.loginCodeRepository.invalidateAccountCodes();

    this.loginCodeRepository.code_hash = await hash(code, 12);
    this.loginCodeRepository.expires_at = expiresAt;
    await this.loginCodeRepository.create();

    const sendEmailService = new SendEmailService();

    sendEmailService.from = process.env.MAIL_FROM!;
    sendEmailService.to = account.email;
    sendEmailService.subject = "Abatimentos Tirol - Codigo de acesso";
    sendEmailService.template = "login-code";
    sendEmailService.templateData = {
      account,
      code,
      expires_in_minutes: expiresInMinutes,
      portal_url: process.env.PORTAL_URL ?? "https://abatimentos.tirol.com.br",
    };

    await sendEmailService.execute();

    return {
      two_factor_required: true,
      email: account.email,
      expires_in_minutes: expiresInMinutes,
    };
  }

  private generateCode() {
    return String(randomInt(100000, 1000000));
  }
}
