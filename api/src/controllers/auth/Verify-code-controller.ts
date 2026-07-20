import type { FastifyReply, FastifyRequest } from "fastify";
import { VerifyCodeService } from "../../services/auth/Verify-code-service.js";

type VerifyCodeData = {
  email: string
  code: string
}

export type VerifyCodeRequest = {
  Body: VerifyCodeData
}

export class VerifyCodeController {
  private readonly verifyCodeService: VerifyCodeService;

  constructor() {
    this.verifyCodeService = new VerifyCodeService();
  }

  public async handle(request: FastifyRequest<VerifyCodeRequest>, reply: FastifyReply) {
    const {
      email,
      code
    } = request.body;

    this.verifyCodeService.email = email;
    this.verifyCodeService.code = code;

    const account = await this.verifyCodeService.execute();

    const token = request.server.jwt.sign({
      sub: account.id,
      cnpj_root: account.cnpj_root,
      role: account.role
    }, {
      expiresIn: '1h'
    });

    return reply.code(200).cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production" ? true : false,
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
      path: '/',
      domain: process.env.NODE_ENV == "production" ? ".tirol.com.br" : "localhost",
    }).send({
      account,
    });
  }
}
