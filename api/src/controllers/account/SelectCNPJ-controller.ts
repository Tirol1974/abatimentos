import type { FastifyReply, FastifyRequest } from "fastify";
import { SelectCNPJService } from "../../services/auth/SelectCNPJ-service.js";
import { ApiError } from "../../utils/ApiError.js";

type SelectCNPJData = {
  cnpj: string;
}

export type SelectCNPJRequest = {
  Body: SelectCNPJData
}

export class SelectCNPJController {
  private readonly selectCNPJService: SelectCNPJService;
  
  constructor() {
    this.selectCNPJService = new SelectCNPJService();
  }

  public async handle(request: FastifyRequest<SelectCNPJRequest>, reply: FastifyReply) {
    const {
      cnpj
    } = request.body;

    this.selectCNPJService.cnpj = cnpj;
    this.selectCNPJService.account_id = request.user.sub;

    const account = await this.selectCNPJService.execute();

    if (!account) {
      throw new ApiError("Conta não encontrada", 500);
    }

    const token = request.server.jwt.sign({
      sub: request.user.sub,
      cnpj: account.cnpj,
      role: request.user.role
    }, {
      expiresIn: '1h'
    });

    reply.cookie('auth_token', token, {
      httpOnly: true, //Previne que ele seja acessado pelo JS do lado do cliente
      secure: process.env.NODE_ENV == "production" ? true : false, //Permite que ele seja acessado apenas com HTTPS, false em DEV quando subir pra PRD tem que ser true
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax", //Cross site são requisições que serão feitas de um dominio para outro. none = "exposto pra ser gerenciado em dominios diferentes, apenas quando secure for true
      //"
      //maxAge: 60 * 60 * 1000 * 30 -> Valido por 30 dias 
      maxAge: 60 * 60 * 1000, //Valido por 1 hora
      path: '/',
      domain: process.env.NODE_ENV == "production" ? ".tirol.com.br" : "localhost", //Com o . na frente do dominio, ele funciona para o dominio e subdominios.
    });

    return reply.code(200).send({
      account,
    });
  }
}
