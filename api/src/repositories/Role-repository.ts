import { prisma } from "../infra/prisma/index.js";
import type { PrismaTransactionClient } from "./index.js";

export enum RolesEnum {
  OPERATOR = "operator",
  ADMIN = "admin"
}

export class RoleRepository {
  public name: string = "";
  public slug: string = "";
  
  constructor(
    private readonly prismaClient: PrismaTransactionClient = prisma
  ) {}

  public async findBySlug() {
    return await this.prismaClient.role.findFirst({
      where: {
        slug: this.slug
      }
    });
  }

  public async list() {
    return await this.prismaClient.role.findMany({
      orderBy: {
        name: "asc",
      }
    });
  }
}
