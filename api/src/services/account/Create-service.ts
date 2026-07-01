import { randomInt } from "node:crypto";
import { AccountRepository } from "../../repositories/Account-repository.js";
import { AccountRoleRepository } from "../../repositories/AccountRoles-repository.js";
import { RoleRepository } from "../../repositories/Role-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { SendEmailService } from "../email/send-email-service.js";

export class CreateAccountService {
  public name: string = "";
  public email: string = "";
  public role: string = "";
  private password: string = "";

  private readonly accountRepository: AccountRepository;
  private readonly accountRoleRepository: AccountRoleRepository;
  private readonly roleRepository: RoleRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.accountRoleRepository = new AccountRoleRepository();
    this.roleRepository = new RoleRepository();
  }

  public async execute() {
    this.accountRepository.name = this.name;
    this.accountRepository.email = this.email;

    const accountExists = await this.accountRepository.findByEmail();

    if (accountExists) {
      throw new ApiError("Já existe uma conta com esse e-mail cadastrado", 400);
    }

    this.password = await this.generatePassword();

    this.accountRepository.password = this.password;


    const account = await this.accountRepository.create();

    this.roleRepository.slug = this.role;

    const role = await this.roleRepository.findBySlug();

    if (!role) {
      throw new ApiError("Função não encontrada", 404);
    }

    this.accountRoleRepository.account_id = account.id;
    this.accountRoleRepository.role_id = role.id;

    await this.accountRoleRepository.createAccountRole();

    const sendEmailService = new SendEmailService();

    sendEmailService.from = process.env.MAIL_FROM!;
    sendEmailService.subject = "Abatimentos Tirol - Criação de Conta";
    sendEmailService.to = this.email;
    sendEmailService.html = `<p>A sua senha inicial para acessar sua conta no portal de abatimentos Tirol é <strong>${this.password}</strong></p>`;

    await sendEmailService.execute();

    return account;
  }

  public async generatePassword() {
    const letters = process.env.PASS_CHARS!;
    const numbers = process.env.PASS_NUMBERS!;
    const specials = process.env.PASS_SPECIAL_CHARS!;

    const password: string[] = [];

    password.push(letters[randomInt(letters.length)]!);
    password.push(numbers[randomInt(numbers.length)]!);
    password.push(specials[randomInt(specials.length)]!);

    const all = letters + numbers + specials;

    while (password.length < 8) {
      password.push(all[randomInt(all.length)]!);
    }

    // embaralha (Fisher-Yates)
    for (let i = password.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [password[i], password[j]] = [password[j]!, password[i]!];
    }

    return password.join("");
  }
}