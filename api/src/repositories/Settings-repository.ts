import { prisma } from "../infra/prisma/index.js";
import type { PrismaTransactionClient } from "./index.js";

export class SettingsRepository {
  public devolucao_days_back: number = 5;
  public venda_days_forward: number = 7;
  public abatimentos_mail_to: string = "";

  constructor(
    private readonly prismaClient: PrismaTransactionClient = prisma
  ) {}

  public async get() {
    const settings = await this.prismaClient.settings.findFirst({
      orderBy: {
        id: "asc"
      }
    });

    if (settings) {
      return settings;
    }

    return await this.prismaClient.settings.create({
      data: {
        devolucao_days_back: this.devolucao_days_back,
        venda_days_forward: this.venda_days_forward,
        abatimentos_mail_to: this.abatimentos_mail_to,
      }
    });
  }

  public async update() {
    const settings = await this.get();

    return await this.prismaClient.settings.update({
      where: {
        id: settings.id
      },
      data: {
        devolucao_days_back: this.devolucao_days_back,
        venda_days_forward: this.venda_days_forward,
        abatimentos_mail_to: this.abatimentos_mail_to,
        updated_at: new Date(),
      }
    });
  }
}
