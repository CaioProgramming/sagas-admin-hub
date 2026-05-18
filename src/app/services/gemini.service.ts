import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { secrets } from '../../environments/environment.secret';
import {
  GemmaModelService,
  ModelRequirement,
} from './gemma-model.service';
import { TranslationService } from './translation.service';

export type ImageTestType = 'ICON' | 'COVER';

const AUDIT_REQUIREMENT: ModelRequirement = 'HIGH';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private gemmaModel = inject(GemmaModelService);
  private translationService = inject(TranslationService);
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
    const lang = this.translationService.currentLang() === 'pt-br' ? 'Portuguese (Brazil)' : 'English (United States)';
    const { model } = await this.getGenerativeModel(
      AUDIT_REQUIREMENT,
      `You are the 'Sagas Soul Auditor'. Analyze genre configurations for consistency.
      You MUST write your analysis, critique, and immersion suggestions strictly in the requested language: ${lang}.
      However, if you include a JSON block with the key 'SUGGESTED_CHANGES', the JSON keys and structural content MUST remain exactly as specified in English so it can be parsed programmatically.`
    );
    const prompt = `Analyze the configuration for '${genreName}':\n\n${JSON.stringify(config, null, 2)}\n\n1. Identify any contradictions between art style and tone.\n2. Provide three immersion suggestions.\n3. Provide a SUGGESTED_CHANGES JSON block if needed.
    
    REMINDER: Write all explanations, critiques, and suggestions in ${lang}.`;

    try {
      const result = await model.generateContent(prompt);
      return (await result.response).text();
    } catch (error) {
      console.error('Gemini Audit Error:', error);
      return 'Error: Could not perform AI audit. Check API key and quota.';
    }
  }

}
