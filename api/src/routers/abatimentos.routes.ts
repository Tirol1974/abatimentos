import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from 'zod';
import { checkAuth } from "../middleware/jwt.js";
import { checkAdminAuth } from "../middleware/adminAuth.js";
import { CreateAbatimentoController, type CreateAbatimentoRequest } from "../controllers/abatimentos/Create-controller.js";
import { ListAbatimentosController } from "../controllers/abatimentos/List-controller.js";
import { ListAdminAbatimentosController } from "../controllers/abatimentos/List-admin-controller.js";
import { AttachBoletoController, type AttachBoletoRequest } from "../controllers/abatimentos/Attach-boleto-controller.js";
import { DownloadBoletoController, type DownloadBoletoRequest } from "../controllers/abatimentos/Download-boleto-controller.js";
import { ChangeAbatimentoStatusController, type ChangeAbatimentoStatusRequest } from "../controllers/abatimentos/Change-status-controller.js";

export async function AbatimentosRoutes(
  fastify: FastifyInstance
) {
  const createAbatimentoController = new CreateAbatimentoController();
  const listAbatimentosController = new ListAbatimentosController();
  const listAdminAbatimentosController = new ListAdminAbatimentosController();
  const attachBoletoController = new AttachBoletoController();
  const downloadBoletoController = new DownloadBoletoController();
  const changeAbatimentoStatusController = new ChangeAbatimentoStatusController();

  const ErrorResponseSchema = z.object({
    status: z.literal("ERROR"),
    message: z.string()
  });

  const PartidaAbatimentoSchema = z.object({
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
  });

  const AbatimentoResponseSchema = z.object({
    id: z.number(),
    devolucoes: z.array(PartidaAbatimentoSchema),
    vendas: z.array(PartidaAbatimentoSchema),
    status: z.enum(["solicitado", "atendimento", "finalizado"]),
    total_devolucoes: z.number(),
    total_vendas: z.number(),
    boleto_file_name: z.string().nullable(),
    boleto_uploaded_at: z.date().nullable(),
    boleto_download_url: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
  });

  fastify.post(
    "/abatimentos",
    {
      schema: {
        tags: ["Abatimentos"],
        description: "Endpoint responsavel por criar um novo abatimento",
        security: [
          {
            bearerAuth: []
          }
        ],
        body: z.object({
          devolucoes: z.array(PartidaAbatimentoSchema).min(1),
          vendas: z.array(PartidaAbatimentoSchema).min(1),
        }),
        response: {
          201: z.object({
            abatimento: AbatimentoResponseSchema,
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return createAbatimentoController.handle(request as FastifyRequest<CreateAbatimentoRequest>, reply);
    }
  );

  fastify.get(
    "/abatimentos",
    {
      schema: {
        tags: ["Abatimentos"],
        description: "Endpoint responsavel por listar os abatimentos da conta logada",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.array(AbatimentoResponseSchema),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return listAbatimentosController.handle(request, reply);
    }
  );

  fastify.get(
    "/abatimentos/admin",
    {
      schema: {
        tags: ["Abatimentos"],
        description: "Endpoint responsavel por listar todos os abatimentos para atendimento",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.array(z.any()),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return listAdminAbatimentosController.handle(request, reply);
    }
  );

  fastify.post(
    "/abatimentos/:abatimento_id/boleto",
    {
      schema: {
        tags: ["Abatimentos"],
        description: "Endpoint responsavel por anexar o boleto de um abatimento",
        security: [
          {
            bearerAuth: []
          }
        ],
        params: z.object({
          abatimento_id: z.coerce.number()
        }),
        body: z.object({
          file_name: z.string(),
          boleto_base64: z.string(),
        }),
        response: {
          200: z.object({
            abatimento: z.any(),
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
      bodyLimit: 12 * 1024 * 1024,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return attachBoletoController.handle(request as FastifyRequest<AttachBoletoRequest>, reply);
    }
  );

  fastify.patch(
    "/abatimentos/:abatimento_id/status",
    {
      schema: {
        tags: ["Abatimentos"],
        description: "Endpoint responsavel por alterar o status de um abatimento",
        security: [
          {
            bearerAuth: []
          }
        ],
        params: z.object({
          abatimento_id: z.coerce.number()
        }),
        body: z.object({
          status: z.enum(["solicitado", "atendimento", "finalizado"]),
        }),
        response: {
          200: z.object({
            abatimento: z.any(),
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return changeAbatimentoStatusController.handle(request as FastifyRequest<ChangeAbatimentoStatusRequest>, reply);
    }
  );

  fastify.get(
    "/abatimentos/:abatimento_id/boleto",
    {
      schema: {
        tags: ["Abatimentos"],
        description: "Endpoint responsavel por baixar o boleto de um abatimento",
        security: [
          {
            bearerAuth: []
          }
        ],
        params: z.object({
          abatimento_id: z.coerce.number()
        }),
        response: {
          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return downloadBoletoController.handle(request as FastifyRequest<DownloadBoletoRequest>, reply);
    }
  );
}
