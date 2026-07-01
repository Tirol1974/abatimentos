import type { FastifyReply, FastifyRequest } from "fastify";

export class SignOutController {
  public async handle(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    reply.clearCookie('auth_token', {
      path: '/',
      domain: process.env.NODE_ENV == "production" ? ".tirol.com.br" : "localhost",
    });

    return reply.code(204).send({
      message: "Sessão encerrada com sucesso"
    });
  }
}