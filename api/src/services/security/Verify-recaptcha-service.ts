import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { ApiError } from "../../utils/ApiError.js";

export class VerifyRecaptchaService {
  public token = "";
  public expected_action = "";
  private readonly client: RecaptchaEnterpriseServiceClient;

  constructor() {
    this.client = new RecaptchaEnterpriseServiceClient();
  }

  public async execute() {
    const projectPath = this.client.projectPath(process.env.RECAPTCHA_PROJECT_ID!);

    const request = ({
      assessment: {
        event: {
          token: this.token,
          siteKey: process.env.RECAPTCHA_SITE_KEY!,
          expectedAction: this.expected_action
        },
      },
      parent: projectPath,
    });

    const [response] = await this.client.createAssessment(request).catch((error) => {
      console.log("Erro ao criar assessment reCAPTCHA");
      console.log(error);

      throw new ApiError("Falha na comunicacao com o reCAPTCHA", 500);
    });

    if (!response.tokenProperties?.valid) {
      throw new ApiError("Falha na validacao do reCAPTCHA", 400);
    }

    if (response.tokenProperties.action === this.expected_action) {
      const minScore = Number(process.env.RECAPTCHA_MIN_SCORE) || 0.5;

      const score = response.riskAnalysis?.score;

      if (score == null || score < minScore) {
        throw new ApiError("Falha na validacao do reCAPTCHA", 400);
      }

      return response.riskAnalysis?.score;
    } else {
      throw new ApiError("Falha na validacao do reCAPTCHA", 400);
    }
  }
}