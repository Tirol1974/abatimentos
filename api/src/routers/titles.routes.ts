import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from 'zod';
import { ListRolesController } from "../controllers/roles/List-controller.js";
import { checkAdminAuth } from "../middleware/adminAuth.js";
import { checkAuth } from "../middleware/jwt.js";
import { FetchTitlesController } from "../controllers/titulos/fetch-titles-controller.js";

export async function TitlesRoutes(
  fastify: FastifyInstance
) {
  const fetchTitlesController = new FetchTitlesController();

  const ErrorResponseSchema = z.object({
    status: z.literal("ERROR"),
    message: z.string()
  });

  fastify.get(
    "/titles",
    {
      schema: {
        tags: ["Títulos"],
        description: "Endpoint responsável por buscar no SAP os títulos do cliente que estão em aberto",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.object({
            titles: z.array(
              z.object({
                id: z.string(),
                bukrs: z.string(),
                belnr: z.string(),
                gjahr: z.number(),
                buzei: z.number(),
                kunnr: z.string(),
                budat: z.string(),
                zfbdt: z.string(),
                zbd1t: z.number(),
                dmbtr: z.number(),
                wrbtr: z.number(),
                xblnr: z.string(),
                zuonr: z.string(),
                sgtxt: z.string()
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
      return fetchTitlesController.handle(request, reply);
    }
  );
}
