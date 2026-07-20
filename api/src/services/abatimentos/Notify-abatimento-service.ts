import { AccountRepository } from "../../repositories/Account-repository.js";
import { SendEmailService } from "../email/send-email-service.js";

type PartidaAbatimento = {
  valor: number;
}

type AbatimentoEmailData = {
  id: number;
  devolucoes: unknown;
  vendas: unknown;
  account_id: number;
  boleto_file_name?: string | null;
}

export class NotifyAbatimentoService {
  private readonly accountRepository: AccountRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  public async notifySolicitado(abatimento: AbatimentoEmailData) {
    const to = process.env.ABATIMENTOS_MAIL_TO;

    if (!to) {
      return;
    }

    const account = await this.findAccount(abatimento.account_id);
    const totals = this.getTotals(abatimento);
    const portalUrl = this.getPortalUrl();
    const sendEmailService = new SendEmailService();

    sendEmailService.from = process.env.MAIL_FROM!;
    sendEmailService.to = to;
    sendEmailService.subject = `Nova solicitacao de abatimento #${abatimento.id}`;
    sendEmailService.template = "abatimento-solicitado";
    sendEmailService.templateData = {
      abatimento,
      account,
      totals,
      admin_url: `${portalUrl}/abatimentos`,
    };

    await this.safeSend(sendEmailService);
  }

  public async notifyFinalizado(abatimento: AbatimentoEmailData) {
    const account = await this.findAccount(abatimento.account_id);
    const totals = this.getTotals(abatimento);
    const sendEmailService = new SendEmailService();

    sendEmailService.from = process.env.MAIL_FROM!;
    sendEmailService.to = account.email;
    sendEmailService.subject = `Boleto disponivel para o abatimento #${abatimento.id}`;
    sendEmailService.template = "abatimento-finalizado";
    sendEmailService.templateData = {
      abatimento,
      totals,
      boleto_file_name: abatimento.boleto_file_name ?? "boleto.pdf",
      portal_url: this.getPortalUrl(),
    };

    await this.safeSend(sendEmailService);
  }

  public async notifyAtendimento(abatimento: AbatimentoEmailData) {
    const account = await this.findAccount(abatimento.account_id);
    const totals = this.getTotals(abatimento);
    const sendEmailService = new SendEmailService();

    sendEmailService.from = process.env.MAIL_FROM!;
    sendEmailService.to = account.email;
    sendEmailService.subject = `Atendimento iniciado para o abatimento #${abatimento.id}`;
    sendEmailService.template = "abatimento-atendimento";
    sendEmailService.templateData = {
      abatimento,
      totals,
      portal_url: this.getPortalUrl(),
    };

    await this.safeSend(sendEmailService);
  }

  private async findAccount(accountId: number) {
    this.accountRepository.account_id = accountId;

    const account = await this.accountRepository.findById();

    return {
      id: account?.id ?? accountId,
      name: account?.name ?? "Cliente",
      email: account?.email ?? "",
      cnpj_root: account?.cnpj_root ?? "",
    };
  }

  private getTotals(abatimento: AbatimentoEmailData) {
    const devolucoes = this.normalizePartidas(abatimento.devolucoes);
    const vendas = this.normalizePartidas(abatimento.vendas);
    const totalDevolucoes = devolucoes.reduce((total, partida) => total + partida.valor, 0);
    const totalVendas = vendas.reduce((total, partida) => total + partida.valor, 0);

    return {
      devolucoes: this.formatCurrency(totalDevolucoes),
      vendas: this.formatCurrency(totalVendas * -1),
    };
  }

  private normalizePartidas(data: unknown): PartidaAbatimento[] {
    if (Array.isArray(data)) {
      return data.filter((partida): partida is PartidaAbatimento => {
        return typeof partida == "object" && partida != null && "valor" in partida && typeof partida.valor == "number";
      });
    }

    return [];
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  private getPortalUrl() {
    return process.env.PORTAL_URL ?? "https://abatimentos.tirol.com.br";
  }

  private async safeSend(sendEmailService: SendEmailService) {
    try {
      await sendEmailService.execute();
    } catch (error) {
      console.error(error);
    }
  }
}
