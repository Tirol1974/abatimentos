import { prisma } from "../infra/prisma/index.js";
import type { PrismaTransactionClient } from "./index.js";

export class ResetPasswordTokenRepository {
  public password_reset_token_id: number = 0;
  public account_id: number = 0;
  public token_hash: string = "";
  public expires_at: Date = new Date();

  constructor(
    private readonly prismaClient: PrismaTransactionClient = prisma
  ) {}

  public async create() {
    const resetPasswordToken = await this.prismaClient.passwordResetToken.create({
      data: {
        account_id: this.account_id,
        token_hash: this.token_hash,
        expires_at: this.expires_at,
      }
    });

    return resetPasswordToken;
  }

  public async invalidateAccountResetPasswordTokens() {
    await this.prismaClient.passwordResetToken.updateMany({
      where: {
        account_id: this.account_id,
        used_at: null,
      },
      data: {
        used_at: new Date(),
      }
    });
  }

  public async findValidByTokenHash() {
    return await this.prismaClient.passwordResetToken.findFirst({
      where: {
        token_hash: this.token_hash,
        used_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        account: true,
      },
    });
  }

  public async markAsUsed() {
    await this.prismaClient.passwordResetToken.update({
      where: {
        id: this.password_reset_token_id,
      },
      data: {
        used_at: new Date(),
      }
    });
  }
}
