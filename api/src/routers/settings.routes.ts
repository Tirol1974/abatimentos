import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from "zod";
import { GetSettingsController } from "../controllers/settings/Get-controller.js";
import { UpdateSettingsController, type UpdateSettingsRequest } from "../controllers/settings/Update-controller.js";
import { checkAdminAuth } from "../middleware/adminAuth.js";
import { checkAuth } from "../middleware/jwt.js";

export async function SettingsRoutes(
  fastify: FastifyInstance
) {
  const getSettingsController = new GetSettingsController();
  const updateSettingsController = new UpdateSettingsController();

  const ErrorResponseSchema = z.object({
    status: z.literal("ERROR"),
    message: z.string()
  });

  const SettingsResponseSchema = z.object({
    id: z.number(),
    validity_days: z.number(),
    devolucao_days_back: z.number(),
    venda_days_forward: z.number(),
    abatimentos_mail_to: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
  });

  fastify.get(
    "/settings",
    {
      schema: {
        tags: ["Configuracoes"],
        description: "Endpoint responsavel por buscar as configuracoes do portal",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.object({
            settings: SettingsResponseSchema
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return getSettingsController.handle(request, reply);
    }
  );

  fastify.patch(
    "/settings",
    {
      schema: {
        tags: ["Configuracoes"],
        description: "Endpoint responsavel por atualizar as configuracoes do portal",
        security: [
          {
            bearerAuth: []
          }
        ],
        body: z.object({
          devolucao_days_back: z.number().int().min(0).max(365),
          venda_days_forward: z.number().int().min(0).max(365),
          abatimentos_mail_to: z.email(),
        }),
        response: {
          200: z.object({
            settings: SettingsResponseSchema
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return updateSettingsController.handle(request as FastifyRequest<UpdateSettingsRequest>, reply);
    }
  );
}
