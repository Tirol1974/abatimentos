import { SettingsRepository } from "../../repositories/Settings-repository.js";

export class UpdateSettingsService {
  public devolucao_days_back: number = 5;
  public venda_days_forward: number = 7;
  public abatimentos_mail_to: string = "";

  private readonly settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  public async execute() {
    this.settingsRepository.devolucao_days_back = this.devolucao_days_back;
    this.settingsRepository.venda_days_forward = this.venda_days_forward;
    this.settingsRepository.abatimentos_mail_to = this.abatimentos_mail_to;

    return await this.settingsRepository.update();
  }
}
