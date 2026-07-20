import { prisma } from "../infra/prisma/index.js";
import type { PrismaTransactionClient } from "./index.js";

export class LoginCodeRepository {
  public login_code_id: number = 0;
  public account_id: number = 0;
  public code_hash: string = "";
  public expires_at: Date = new Date();

  constructor(
    private readonly prismaClient: PrismaTransactionClient = prisma
  ) {}

  public async create() {
    const loginCode = await this.prismaClient.loginCode.create({
      data: {
        account_id: this.account_id,
        code_hash: this.code_hash,
        expires_at: this.expires_at,
      }
    });

    return loginCode;
  }

  public async invalidateAccountCodes() {
    await this.prismaClient.loginCode.updateMany({
      where: {
        account_id: this.account_id,
        used_at: null,
      },
      data: {
        used_at: new Date(),
      }
    });
  }

  public async findLastValidByAccountId() {
    const loginCode = await this.prismaClient.loginCode.findFirst({
      where: {
        account_id: this.account_id,
        used_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: {
        created_at: "desc",
      }
    });

    return loginCode;
  }

  public async markAsUsed() {
    await this.prismaClient.loginCode.update({
      where: {
        id: this.login_code_id,
      },
      data: {
        used_at: new Date(),
      }
    });
  }
}
