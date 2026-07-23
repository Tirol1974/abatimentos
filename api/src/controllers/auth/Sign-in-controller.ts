import type { FastifyReply, FastifyRequest } from "fastify";
import { SignInService } from "../../services/auth/Sign-in-service.js";
import { VerifyRecaptchaService } from "../../services/security/Verify-recaptcha-service.js";

type SignInData = {
  email: string
  password: string
  recaptcha_token: string
}

export type SignInRequest = {
  Body: SignInData
}

export class SignInController {
  private readonly signInService: SignInService;
  private readonly verifyRecaptchaService: VerifyRecaptchaService;
  
  constructor() {
    this.signInService = new SignInService();
    this.verifyRecaptchaService = new VerifyRecaptchaService();
  }

  public async handle(request: FastifyRequest<SignInRequest>, reply: FastifyReply) {
    const {
      email,
      password,
      recaptcha_token
    } = request.body;

    this.signInService.email = email;
    this.signInService.password = password;

    this.verifyRecaptchaService.token = recaptcha_token;
    this.verifyRecaptchaService.expected_action = "sign_in";

    await this.verifyRecaptchaService.execute();

    const result = await this.signInService.execute();

    return reply.code(200).send(result);
  }
}
