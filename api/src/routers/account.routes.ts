import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from 'zod';
import { CreateAccountController, type CreateAccountRequest } from "../controllers/account/Create-controller.js";
import { checkAuth } from "../middleware/jwt.js";
import { ListCNPJSController, type ListCnpjsRequestData } from "../controllers/account/ListCNPSController.js";
import { checkAdminAuth } from "../middleware/adminAuth.js";
import { ListAccountsController } from "../controllers/account/List-controller.js";
import { AccountDetailsController, type AccountDetailsControllerRequest } from "../controllers/account/Details-controller.js";
import { AccountUpdateController, type AccountUpdateRequest } from "../controllers/account/Update-controller.js";

export async function AccountRoutes(
  fastify: FastifyInstance
) {
  const createAccountController = new CreateAccountController();
  const listCNPJSController = new ListCNPJSController();
  const listAccountsController = new ListAccountsController();
  const accountDetailsController = new AccountDetailsController();
  const accountUpdateController = new AccountUpdateController();

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
          role: z.enum(["cliente", "admin"]),
          cnpj_root: z.string(),
        }).superRefine(({ role, cnpj_root }, ctx) => {
          if (role == "cliente") {
            if (cnpj_root == "" || (cnpj_root.length < 8 || cnpj_root.length > 8)) {
              ctx.addIssue({
                code: "custom",
                message: "A raiz do CNPJ precisa ter 8 caracteres"
              });
            }
          }
        }),
        response: {
          201: z.object({
            account: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string(),
              cnpj_root: z.string(),
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
  
  fastify.put(
    "/account",
    {
      schema: {
        tags: ["Contas de Acesso"],
        description: "Endpoint responsável por atualizar uma conta",
        security: [
          {
            bearerAuth: []
          }
        ],
        body: z.object({
          account_id: z.number(),
          name: z.string(),
          email: z.string(),
          cnpj_root: z.string().min(8, "A raiz do CNPJ precisa ter 8 caracteres").max(8, "A raiz do CNPJ precisa ter 8 caracteres"),
          role: z.enum(["cliente", "admin"])
        }),
        response: {
          200: z.object({
            account: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string(),
              role: z.string(),
              cnpj_root: z.string(),
              first_login: z.boolean(),
              created_at: z.date(),
              updated_at: z.date(),
            }),
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],  
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return accountUpdateController.handle(request as FastifyRequest<AccountUpdateRequest>, reply);
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
          200: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              email: z.string(),
              role: z.string(),
              cnpj_root: z.string(),
              created_at: z.date(),
              updated_at: z.date(),
            })
          ),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return listAccountsController.handle(request, reply);
    }
  );
  
  fastify.get(
    "/account/cnpjs",
    {
      schema: {
        tags: ["Contas de Acesso"],
        description: "Endpoint responsável por retornar os CNPJs da raiz de CNPJ vinculado a conta",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.object({
            cnpjs: z.array(
              z.object({
                kunnr: z.string(),
                stcd1: z.string(),
              })
            )
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return listCNPJSController.handle(request as FastifyRequest<ListCnpjsRequestData>, reply);
    }
  );
  
  fastify.get(
    "/account/:account_id/details",
    {
      schema: {
        tags: ["Contas de Acesso"],
        description: "Endpoint responsável por retornar os detalhes de uma conta",
        security: [
          {
            bearerAuth: []
          }
        ],
        response: {
          200: z.object({
            account: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string(),
              role: z.string(),
              first_login: z.boolean(),
              cnpj_root: z.string(),
              created_at: z.date(),
              updated_at: z.date(),
            }),
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth, checkAdminAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return accountDetailsController.handle(request as FastifyRequest<AccountDetailsControllerRequest>, reply);
    }
  );
}
