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
import { VerifyCodeController, type VerifyCodeRequest } from "../controllers/auth/Verify-code-controller.js";
import { FirstLoginController, type FirstLoginRequest } from "../controllers/auth/First-login-controller.js";
import { SendResetPasswordLinkController, type SendResetPasswordLinkRequest } from "../controllers/auth/Send-reset-password-link-controller.js";
import { ConfirmResetPasswordController, type ConfirmResetPasswordRequest } from "../controllers/auth/Confirm-reset-password-controller.js";

export async function AuthRoutes(
  fastify: FastifyInstance
) {
  const signInController = new SignInController();
  const signOutController = new SignOutController();
  const meController = new MeController();
  const changePasswordController = new ChangePasswordController();
  const verifyCodeController = new VerifyCodeController();
  const firstLoginController = new FirstLoginController();
  const sendResetPasswordLinkController = new SendResetPasswordLinkController();
  const confirmResetPasswordController = new ConfirmResetPasswordController();

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
          email: z.email(),
          password: z.string()
        }),
        response: {
          200: z.object({
            two_factor_required: z.boolean(),
            email: z.email(),
            expires_in_minutes: z.number(),
          }),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_SIGN_IN_MAX) || 5,
          timeWindow: process.env.RATE_LIMIT_SIGN_IN_TIME_WINDOW || "1 minute",
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return signInController.handle(request as FastifyRequest<SignInRequest>, reply);
    }
  );

  fastify.post(
    "/auth/verify-code",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsavel por validar o codigo de acesso enviado por e-mail",
        body: z.object({
          email: z.email(),
          code: z.string().length(6, "O codigo precisa ter 6 digitos"),
        }),
        response: {
          200: z.object({
            account: z.object({
              id: z.number(),
              name: z.string(),
              email: z.email(),
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
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_VERIFY_CODE_MAX) || 5,
          timeWindow: process.env.RATE_LIMIT_VERIFY_CODE_TIME_WINDOW || "1 minute",
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return verifyCodeController.handle(request as FastifyRequest<VerifyCodeRequest>, reply);
    }
  );
  
  fastify.post(
    "/auth/first-login",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsavel por validar o primeiro acesso do cliente",
        body: z.object({
          email: z.email(),
        }),
        response: {
          204: z.void(),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_FIRST_LOGIN_MAX) || 5,
          timeWindow: process.env.RATE_LIMIT_FIRST_LOGIN_TIME_WINDOW || "1 minute",
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return firstLoginController.handle(request as FastifyRequest<FirstLoginRequest>, reply);
    }
  );
  
  fastify.post(
    "/auth/send-reset-password-link",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsavel por enviar o e-mail com o link para redefinição da senha do usuário",
        body: z.object({
          email: z.email(),
        }),
        response: {
          204: z.void(),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_SEND_RESET_PASS_LINK_MAX) || 5,
          timeWindow: process.env.RATE_LIMIT_SEND_RESET_PASS_LINK_TIME_WINDOW || "1 minute",
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return sendResetPasswordLinkController.handle(request as FastifyRequest<SendResetPasswordLinkRequest>, reply);
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
              email: z.email(),
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
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_CHANGE_PASSWORD_MAX) || 5,
          timeWindow: process.env.RATE_LIMIT_CHANGE_PASSWORD_TIME_WINDOW || "1 minute",
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return changePasswordController.handle(request as FastifyRequest<ChangePasswordRequest>, reply);
    }
  );
  
  fastify.patch(
    "/auth/reset-password/confirm",
    {
      schema: {
        tags: ["Autenticação"],
        description: "Endpoint responsável por resetar a senha da conta com o token",
        body: z
          .object({
            token: z.string().min(1, "Token invalido ou expirado"),
            password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres"),
            confirmPassword: z.string(),
          })
          .refine((data) => data.password === data.confirmPassword, {
            message: "As senhas nÃ£o sÃ£o iguais",
            path: ["confirmPassword"],
          }),
        response: {
          204: z.void(),

          400: ErrorResponseSchema,

          500: ErrorResponseSchema
        }
      },
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_RESET_PASS_MAX) || 5,
          timeWindow: process.env.RATE_LIMIT_RESET_PASS_TIME_WINDOW || "1 minute",
        }
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return confirmResetPasswordController.handle(request as FastifyRequest<ConfirmResetPasswordRequest>, reply);
    }
  );
}
