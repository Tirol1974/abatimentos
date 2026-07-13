import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: number;
      cnpj_root: string;
      role: string;
    };

    user: {
      sub: number;
      cnpj_root: string;
      role: string;
    };
  }
}