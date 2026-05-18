import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { secrets } from '../../environments/environment.secret';
import {
  GemmaModelService,
  ModelRequirement,
} from './gemma-model.service';

export type ImageTestType = 'ICON' | 'COVER';

const AUDIT_REQUIREMENT: ModelRequirement = 'HIGH';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private gemmaModel = inject(GemmaModelService);
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(secrets.geminiApiKey);
  }

  private async getGenerativeModel(
    requirement: ModelRequirement,
    systemInstruction?: string
  ): Promise<{ model: GenerativeModel; modelId: string; requirement: ModelRequirement }> {
    const modelId = await this.gemmaModel.resolveModelName(requirement);
    const temperature = this.gemmaModel.temperatureFor(requirement);
    const model = this.genAI.getGenerativeModel({
      model: modelId,
      ...(systemInstruction ? { systemInstruction } : {}),
      generationConfig: { temperature },
    });
    return { model, modelId, requirement };
  }

  async auditGenre(genreName: string, config: unknown): Promise<string> {
    const { model } = await this.getGenerativeModel(
      AUDIT_REQUIREMENT,
      "You are the 'Sagas Soul Auditor'. Analyze genre configurations for consistency. Include a JSON block with key 'SUGGESTED_CHANGES' when needed."
    );
    const prompt = `Analyze the configuration for '${genreName}':\n\n${JSON.stringify(config, null, 2)}\n\n1. Contradictions between art style and tone.\n2. Three immersion suggestions.\n3. SUGGESTED_CHANGES JSON if needed.`;

    try {
      const result = await model.generateContent(prompt);
      return (await result.response).text();
    } catch (error) {
      console.error('Gemini Audit Error:', error);
      return 'Error: Could not perform AI audit. Check API key and quota.';
    }
  }

}
