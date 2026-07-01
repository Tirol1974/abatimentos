import { RoleRepository } from "../../repositories/Role-repository.js";

export class ListRolesService {
  private readonly rolesRepository: RoleRepository;

  constructor() {
    this.rolesRepository = new RoleRepository();
  }

  public async execute() {
    const roles = await this.rolesRepository.list();

    return roles;
  }
}