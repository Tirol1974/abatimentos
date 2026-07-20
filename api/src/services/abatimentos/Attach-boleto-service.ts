import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { AbatimentosRepository } from "../../repositories/Abatimentos-repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { NotifyAbatimentoService } from "./Notify-abatimento-service.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class AttachBoletoService {
  public abatimento_id: number = 0;
  public file_name: string = "";
  public boleto_base64: string = "";

  private readonly abatimentosRepository: AbatimentosRepository;
  private readonly notifyAbatimentoService: NotifyAbatimentoService;

  constructor() {
    this.abatimentosRepository = new AbatimentosRepository();
    this.notifyAbatimentoService = new NotifyAbatimentoService();
  }

  public async execute() {
    this.abatimentosRepository.abatimento_id = this.abatimento_id;

    const abatimento = await this.abatimentosRepository.findById();

    if (!abatimento) {
      throw new ApiError("Abatimento nao encontrado", 400);
    }

    const boletoBuffer = this.parseBoleto();
    const safeFileName = this.sanitizeFileName(this.file_name);
    const relativeDir = path.posix.join("boletos", `abatimento-${this.abatimento_id}`);
    const relativePath = path.posix.join(relativeDir, safeFileName);
    const uploadsDir = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
    const absoluteDir = path.join(uploadsDir, ...relativeDir.split("/"));
    const absolutePath = path.join(uploadsDir, ...relativePath.split("/"));

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, boletoBuffer);

    this.abatimentosRepository.boleto_path = relativePath;
    this.abatimentosRepository.boleto_file_name = safeFileName;

    const updatedAbatimento = await this.abatimentosRepository.attachBoleto();

    await this.notifyAbatimentoService.notifyFinalizado({
      id: updatedAbatimento.id,
      devolucoes: updatedAbatimento.devolucoes,
      vendas: updatedAbatimento.vendas,
      account_id: updatedAbatimento.account_id,
      boleto_file_name: safeFileName,
    });

    return updatedAbatimento;
  }

  private parseBoleto() {
    const cleanBase64 = this.boleto_base64.replace(/^data:application\/pdf;base64,/, "");
    const boletoBuffer = Buffer.from(cleanBase64, "base64");

    if (boletoBuffer.length == 0) {
      throw new ApiError("Arquivo do boleto invalido", 400);
    }

    if (boletoBuffer.length > MAX_FILE_SIZE) {
      throw new ApiError("O boleto precisa ter no maximo 10MB", 400);
    }

    if (boletoBuffer.subarray(0, 4).toString() != "%PDF") {
      throw new ApiError("Envie um arquivo PDF valido", 400);
    }

    return boletoBuffer;
  }

  private sanitizeFileName(fileName: string) {
    const normalizedFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    if (!normalizedFileName.toLowerCase().endsWith(".pdf")) {
      return `${normalizedFileName || "boleto"}.pdf`;
    }

    return normalizedFileName || "boleto.pdf";
  }
}
