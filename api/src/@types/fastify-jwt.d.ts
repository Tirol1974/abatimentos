import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: number;
      cnpj: string;
      role: string;
    };

    user: {
      sub: number;
      cnpj: string;
      role: string;
    };
  }
}