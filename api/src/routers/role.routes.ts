import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from 'zod';
import { ListRolesController } from "../controllers/roles/List-controller.js";
import { checkAdminAuth } from "../middleware/adminAuth.js";
import { checkAuth } from "../middleware/jwt.js";

export async function RolesRoutes(
  fastify: FastifyInstance
) {
  const listRolesController = new ListRolesController();

  const ErrorResponseSchema = z.object({
    status: z.literal("ERROR"),
    message: z.string()
  });

  fastify.get(
    "/roles",
    {
      schema: {
        tags: ["Perfis"],
        description: "Endpoint responsável por listar os perfis das contas de acesso",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              slug: z.string(),
              created_at: z.date(),
              updated_at: z.date()
            }),
          ),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return listRolesController.handle(request, reply);
    }
  );
}
