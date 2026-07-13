import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from 'zod';
import { SignInController, type SignInRequest } from "../controllers/auth/Sign-in-controller.js";
import { SignOutController } from "../controllers/auth/Sign-out-controller.js";
import { checkAuth } from "../middleware/jwt.js";
import { MeController } from "../controllers/auth/Me-controller.js";
import { ChangePasswordController, type ChangePasswordRequest } from "../controllers/auth/Change-password-controller.js";

export async function AuthRoutes(
  fastify: FastifyInstance
) {
  const signInController = new SignInController();
  const signOutController = new SignOutController();
  const meController = new MeController();
  const changePasswordController = new ChangePasswordController();

  const ErrorResponseSchema = z.object({
    status: z.literal("ERROR"),
    message: z.string()
  });

  fastify.post(
    "/auth/sign-in",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsável por fazer a autenticação dos usuários",
        body: z.object({
          email: z.string(),
          password: z.string()
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
            })
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return signInController.handle(request as FastifyRequest<SignInRequest>, reply);
    }
  );

  fastify.get(
    "/auth/me",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsável por trazer os detalhes do usuário",
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
              cnpj_root: z.string(),
              first_login: z.boolean(),
              created_at: z.date(),
              updated_at: z.date(),
            })
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return meController.handle(request, reply);
    }
  );

  fastify.delete(
    "/auth/sign-out",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsável por remover a sessão do usuário",
        response: {
          204: z.object({
            message: z.string()
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return signOutController.handle(request, reply);
    }
  );
  
  fastify.patch(
    "/auth/change-password",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsável por alterar a senha da conta",
        security: [
          {
            bearerAuth: []
          }
        ],
        body: z.object({
          password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres"),
          confirmPassword: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      preHandler: [ checkAuth ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return changePasswordController.handle(request as FastifyRequest<ChangePasswordRequest>, reply);
    }
  );
}
