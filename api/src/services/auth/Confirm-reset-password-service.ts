import { createHash } from "node:crypto";
import { AccountRepository } from "../../repositories/Account-repository.js";
import { ResetPasswordTokenRepository } from "../../repositories/ResetPasswordToken-repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class ConfirmResetPasswordService {
  public token: string = "";
  public password: string = "";
  
  private readonly accountRepository: AccountRepository;
  private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.resetPasswordTokenRepository = new ResetPasswordTokenRepository();
  }

  public async execute() {    
    const tokenHash = createHash("sha256")
      .update(this.token)
      .digest("hex");

    this.resetPasswordTokenRepository.token_hash = tokenHash;

    const resetPasswordToken = await this.resetPasswordTokenRepository.findValidByTokenHash();

    if (!resetPasswordToken) {
      throw new ApiError("Token invalido ou expirado", 400);
    }

    this.accountRepository.password = this.password;

    this.accountRepository.account_id = resetPasswordToken.account.id;

    await this.accountRepository.changePassword();
    await this.accountRepository.changeFirstLogin();

    this.resetPasswordTokenRepository.password_reset_token_id = resetPasswordToken.id;

    await this.resetPasswordTokenRepository.markAsUsed();
  }
}
