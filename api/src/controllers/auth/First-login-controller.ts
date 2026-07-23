import type { FastifyReply, FastifyRequest } from "fastify";
import { SignInService } from "../../services/auth/Sign-in-service.js";
import { FirstLoginService } from "../../services/auth/First-login-service.js";
import { VerifyRecaptchaService } from "../../services/security/Verify-recaptcha-service.js";

type FirstLoginData = {
  email: string
  recaptcha_token: string
}

export type FirstLoginRequest = {
  Body: FirstLoginData
}

export class FirstLoginController {
  private readonly firstLoginService: FirstLoginService;
  private readonly verifyRecaptchaService: VerifyRecaptchaService;
  
  constructor() {
    this.firstLoginService = new FirstLoginService();
    this.verifyRecaptchaService = new VerifyRecaptchaService();
  }

  public async handle(request: FastifyRequest<FirstLoginRequest>, reply: FastifyReply) {
    const {
      email,
      recaptcha_token
    } = request.body;

    this.firstLoginService.email = email;

    this.verifyRecaptchaService.token = recaptcha_token;
    this.verifyRecaptchaService.expected_action = "first_login";

    await this.verifyRecaptchaService.execute();

    await this.firstLoginService.execute();

    return reply.code(204).send();
  }
}
