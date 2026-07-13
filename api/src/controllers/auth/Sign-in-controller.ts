import type { FastifyReply, FastifyRequest } from "fastify";
import { SignInService } from "../../services/auth/Sign-in-service.js";

type SignInData = {
  email: string
  password: string
}

export type SignInRequest = {
  Body: SignInData
}

export class SignInController {
  private readonly signInService: SignInService;
  
  constructor() {
    this.signInService = new SignInService();
  }

  public async handle(request: FastifyRequest<SignInRequest>, reply: FastifyReply) {
    const {
      email,
      password
    } = request.body;

    this.signInService.email = email;
    this.signInService.password = password;

    const account = await this.signInService.execute();

    const token = request.server.jwt.sign({
      sub: account.id,
      cnpj_root: account.cnpj_root,
      role: account.role
    }, {
      expiresIn: '1h'
    });

    return reply.code(200).cookie('auth_token', token, {
      httpOnly: true, //Previne que ele seja acessado pelo JS do lado do cliente
      secure: process.env.NODE_ENV == "production" ? true : false, //Permite que ele seja acessado apenas com HTTPS, false em DEV quando subir pra PRD tem que ser true
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax", //Cross site são requisições que serão feitas de um dominio para outro. none = "exposto pra ser gerenciado em dominios diferentes, apenas quando secure for true
      //"
      //maxAge: 60 * 60 * 1000 * 30 -> Valido por 30 dias 
      maxAge: 60 * 60 * 1000, //Valido por 1 hora
      path: '/',
      domain: process.env.NODE_ENV == "production" ? ".tirol.com.br" : "localhost", //Com o . na frente do dominio, ele funciona para o dominio e subdominios.
    }).send({
      account,
    });
  }
}
