import { prisma } from "../infra/prisma/index.js";
import type { PrismaTransactionClient } from "./index.js";

export type AbatimentoCreditoUtilizadoInput = {
  abatimento_id: number;
  account_id: number;
  doc: string;
  parcela: number;
  tipo: string;
  blart: string;
  referencia: string;
  valor_original: number;
  valor_utilizado: number;
}

export class AbatimentoCreditosUtilizadosRepository {
  public account_id: number = 0;
  public creditos: AbatimentoCreditoUtilizadoInput[] = [];

  constructor(
    private readonly prismaClient: PrismaTransactionClient = prisma
  ) {}

  public async createMany() {
    if (this.creditos.length == 0) {
      return;
    }

    await this.prismaClient.abatimentoCreditoUtilizado.createMany({
      data: this.creditos,
    });
  }

  public async listByAccountId() {
    return await this.prismaClient.abatimentoCreditoUtilizado.findMany({
      where: {
        account_id: this.account_id,
      },
      orderBy: {
        created_at: "asc",
      }
    });
  }
}
