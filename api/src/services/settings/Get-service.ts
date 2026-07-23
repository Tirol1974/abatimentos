import { SettingsRepository } from "../../repositories/Settings-repository.js";

export class GetSettingsService {
  private readonly settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  public async execute() {
    return await this.settingsRepository.get();
  }
}
