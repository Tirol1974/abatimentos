import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from 'zod';
import { CreateAccountController, type CreateAccountRequest } from "../controllers/account/Create-controller.js";
import { AccountAddCnpjsController, type AccountAddCnpjsRequest } from "../controllers/account/AddCnpjs-controller.js";
import { checkAuth } from "../middleware/jwt.js";
import { ListCNPJSController } from "../controllers/account/ListCNPSController.js";
import { checkAdminAuth } from "../middleware/adminAuth.js";
import { ListAccountsController } from "../controllers/account/List-controller.js";

export async function AccountRoutes(
  fastify: FastifyInstance
) {
  const createAccountController = new CreateAccountController();
  const accountAddCnpjsController = new AccountAddCnpjsController();
  const listCNPJSController = new ListCNPJSController();
  const listAccountsController = new ListAccountsController();

  const ErrorResponseSchema = z.object({
    status: z.literal("ERROR"),
    message: z.string()
  });

  fastify.post(
    "/account",
    {
      schema: {
        tags: ["Contas de Acesso"],
        description: "Endpoint responsável por criar uma conta",
        body: z.object({
          name: z.string(),
          email: z.string(),
          role: z.enum(["operator", "admin"])
        }),
        response: {
          201: z.object({
            account: z.object({
              name: z.string(),
              email: z.string(),
              id: z.number(),
              created_at: z.date(),
              updated_at: z.date(),
            })
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return createAccountController.handle(request as FastifyRequest<CreateAccountRequest>, reply);
    }
  );
  
  fastify.get(
    "/account",
    {
      schema: {
        tags: ["Contas de Acesso"],
        description: "Endpoint responsável por buscar as contas de usuário",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.array(z.object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
            role: z.string(),
            created_at: z.date(),
            updated_at: z.date(),
          })),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return listAccountsController.handle(request, reply);
    }
  );
  
  fastify.post(
    "/account/add-cnpjs",
    {
      schema: {
        tags: ["Contas de Acesso"],
        description: "Endpoint responsável por adicionar CNPJs a uma conta",
        body: z.object({
          cnpjs: z.array(z.string().min(14, "O CNPJ deve conter 14 caracteres")),
          account_id: z.number()
        }),
        response: {
          201: z.object({
            count: z.number()
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return accountAddCnpjsController.handle(request as FastifyRequest<AccountAddCnpjsRequest>, reply);
    }
  );
  
  fastify.get(
    "/account/cnpjs",
    {
      schema: {
        tags: ["Contas de Acesso"],
        description: "Endpoint responsável por retornar os CNPJs da conta",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.object({
            cnpjs: z.array(z.string())
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return listCNPJSController.handle(request, reply);
    }
  );
}
