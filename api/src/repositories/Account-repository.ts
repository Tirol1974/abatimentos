import { hash } from "bcryptjs";
import { prisma } from "../infra/prisma/index.js";
import type { PrismaTransactionClient } from "./index.js";

export class AccountRepository {
  public account_id: number = 0;
  public name: string = "";
  public email: string = "";
  public password: string = "";
  
  constructor(
    private readonly prismaClient: PrismaTransactionClient = prisma
  ) {}

  public async create() {
    let hashed_password = await hash(this.password, 12);

    const account = this.prismaClient.account.create({
      data: {
        name: this.name,
        email: this.email,
        password: hashed_password
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
      }
    });

    return account;
  }

  public async findById() {
    const account = await this.prismaClient.account.findUnique({
      where: { id: this.account_id }
    });

    return account;
  }
  
  public async findByEmail() {
    const account = await this.prismaClient.account.findFirst({
      where: { email: this.email },
    });

    return account;
  }

  public async getAccountDetails() {
    const details = await this.prismaClient.accountRoles.findFirst({
      where: { account_id: this.account_id },
      include: {
        account: true,
        role: true
      }
    });

    return details;
  }

  public async deleteById() {

  }

  public async changePassword() {
    let hashed_password = await hash(this.password, 12);

    const account = await this.prismaClient.account.update({
      where: { id: this.account_id },
      data: {
        password: hashed_password
      }
    });

    return account;
  }

  public async changeFirstLogin() {
    await this.prismaClient.account.update({
      where: { id: this.account_id },
      data: {
        first_login: false,
      }
    });
  }

  public async list() {
    const accounts = await this.prismaClient.accountRoles.findMany({
      include: {
        account: {
          include: {
            accountInfo: true
          }
        },
        role: true,
      }
    });

    return accounts;
  }
}
