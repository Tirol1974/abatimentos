import { prisma } from "../infra/prisma/index.js";
import type { Prisma } from "../../prisma/generated/prisma/client.js";
import type { PrismaTransactionClient } from "./index.js";

export class AbatimentosRepository {
  public abatimento_id: number = 0;
  public account_id: number = 0;
  public devolucoes: Prisma.InputJsonValue = [];
  public vendas: Prisma.InputJsonValue = [];
  public boleto_path: string = "";
  public boleto_file_name: string = "";
  public status: "solicitado" | "atendimento" | "finalizado" = "solicitado";
  public own: boolean = false;

  constructor(
    private readonly prismaClient: PrismaTransactionClient = prisma
  ) {}

  public async create() {
    return await this.prismaClient.abatimento.create({
      data: {
        devolucoes: this.devolucoes,
        vendas: this.vendas,
        account_id: this.account_id,
      }
    });
  }
  
  public async list() {
    if (this.own) {
      return await this.prismaClient.abatimento.findMany({
        where: { account_id: this.account_id },
        orderBy: {
          created_at: "desc"
        }
      });
    }

    return await this.prismaClient.abatimento.findMany({
      orderBy: {
        created_at: "desc"
      }
    });
  }

  public async listWithAccount() {
    return await this.prismaClient.abatimento.findMany({
      include: {
        account: {
          select: {
            id: true,
            name: true,
            email: true,
            cnpj_root: true,
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    });
  }

  public async countByAccountId() {
    return await this.prismaClient.abatimento.count({
      where: { account_id: this.account_id }
    });
  }

  public async findById() {
    return await this.prismaClient.abatimento.findUnique({
      where: { id: this.abatimento_id }
    });
  }

  public async attachBoleto() {
    return await (this.prismaClient.abatimento as any).update({
      where: { id: this.abatimento_id },
      data: {
        boleto_path: this.boleto_path,
        boleto_file_name: this.boleto_file_name,
        boleto_uploaded_at: new Date(),
        status: "finalizado",
      }
    });
  }

  public async changeStatus() {
    return await this.prismaClient.abatimento.update({
      where: { id: this.abatimento_id },
      data: {
        status: this.status,
        updated_at: new Date(),
      }
    });
  }
}
