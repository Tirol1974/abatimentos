import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { ApiError } from "../../utils/ApiError.js";

type DownloadBoletoServiceResponse = {
  file: Buffer;
  file_name: string;
}

type AbatimentoWithBoleto = {
  account_id: number;
  boleto_path: string | null;
  boleto_file_name: string | null;
}

export class DownloadBoletoService {
  public abatimento_id: number = 0;
  public account_id: number = 0;
  public role: string = "";

  private readonly abatimentosRepository: AbatimentosRepository;

  constructor() {
    this.abatimentosRepository = new AbatimentosRepository();
  }

  public async execute(): Promise<DownloadBoletoServiceResponse> {
    this.abatimentosRepository.abatimento_id = this.abatimento_id;

    const abatimento = await this.abatimentosRepository.findById() as AbatimentoWithBoleto | null;

    if (!abatimento) {
      throw new ApiError("Abatimento nao encontrado", 400);
    }

    if (this.role != "admin" && abatimento.account_id != this.account_id) {
      throw new ApiError("Voce nao tem permissao para acessar esse boleto", 401);
    }

    if (!abatimento.boleto_path || !abatimento.boleto_file_name) {
      throw new ApiError("Boleto ainda nao disponivel", 400);
    }

    const uploadsDir = path.resolve(process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads"));
    const boletoPathParts = abatimento.boleto_path.replaceAll("\\", "/").split("/");
    const absolutePath = path.resolve(uploadsDir, ...boletoPathParts);

    if (!absolutePath.startsWith(uploadsDir)) {
      throw new ApiError("Caminho do boleto invalido", 400);
    }

    try {
      await access(absolutePath);
    } catch (error) {
      throw new ApiError("Arquivo do boleto nao encontrado no servidor", 400);
    }

    return {
      file: await readFile(absolutePath),
      file_name: abatimento.boleto_file_name,
    };
  }
}
