import { AccountRepository } from "../../repositories/Account-repository.js";

export class ListAccountsService {
  private readonly accountRepository: AccountRepository;
  
  constructor() {
    this.accountRepository = new AccountRepository();
  }

  public async execute() {
    const accounts = await this.accountRepository.list();
    
    return accounts.map((data) => ({
      id: data.id,
      name: data.account.name,
      email: data.account.email,
      role: data.role.slug,
      cnpj_root: data.account.cnpj_root,
      created_at: data.created_at,
      updated_at: data.updated_at
    }));
  }
}