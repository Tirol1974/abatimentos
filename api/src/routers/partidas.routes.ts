import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from 'zod';
import { checkAuth } from "../middleware/jwt.js";
import { FetchPartidasController, type FetchPartidasRequest } from "../controllers/partidas/fetch-partidas-controller.js";

export async function TitlesRoutes(
  fastify: FastifyInstance
) {
  const fetchPartidasController = new FetchPartidasController();

  const ErrorResponseSchema = z.object({
    status: z.literal("ERROR"),
    message: z.string()
  });

  fastify.post(
    "/partidas",
    {
      schema: {
        tags: ["Partidas FBL5N"],
        description: "Endpoint responsável por buscar no SAP as partidas em aberto dos clientes listados",
        security: [
          {
            bearerAuth: []
          }
        ],
        body: z.object({
          kunnr_list: z.array(
            z.object({
              kunnr: z.string(),
              stcd1: z.string(),
            }),
          ),
          doc_type: z.array(
            z.string()
          ),
          dias_para_vencer: z.number()
        }),
        response: {
          200: z.object({
            resumo: z.object({
              totalAPagar: z.number(),
              totalAReceberSa: z.number(),
              totalAReceberRv: z.number(),
            }),
            partidas: z.array(
              z.object({
                id: z.string(),
                tipo: z.string(),
                blart: z.string(),
                doc: z.string(),
                parcela: z.number(),
                dataDocumento: z.string(),
                dataVencimento: z.string(),
                valor: z.number(),
                referencia: z.string(),
                descricao: z.string(),
              }),
            ),
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return fetchPartidasController.handle(request as FastifyRequest<FetchPartidasRequest>, reply);
    }
  );
}
