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
    const isPt = this.translationService.currentLang() === 'pt-br';
    
    const systemInstruction = isPt 
      ? `Você é o 'Sagas Soul Auditor'. Analise as configurações de gênero fornecidas para garantir consistência.
      Você DEVE escrever toda a sua análise, crítica e sugestões de imersão estritamente em Português (Brasil).
      No entanto, se você incluir um bloco JSON com a chave 'SUGGESTED_CHANGES', as chaves e a estrutura do JSON DEVEM permanecer em inglês para que o sistema possa interpretá-lo programaticamente.`
      : `You are the 'Sagas Soul Auditor'. Analyze genre configurations for consistency.
      You MUST write your analysis, critique, and immersion suggestions strictly in English.
      However, if you include a JSON block with the key 'SUGGESTED_CHANGES', the JSON keys and structural content MUST remain exactly as specified in English so it can be parsed programmatically.`;

    const prompt = isPt
      ? `Analise a seguinte configuração para o gênero '${genreName}':\n\n${JSON.stringify(config, null, 2)}\n\nPor favor, forneça:\n1. Uma análise detalhada identificando qualquer contradição entre o estilo artístico e o tom/diretiva de conversa.\n2. Três sugestões detalhadas de imersão profunda para este gênero.\n3. Um bloco JSON com a chave 'SUGGESTED_CHANGES' se você sugerir alguma alteração de valor na configuração acima.\n\nLEMBRETE: Escreva todo o texto explicativo e as sugestões estritamente em Português (Brasil). O bloco JSON deve ter chaves em inglês.`
      : `Analyze the configuration for '${genreName}':\n\n${JSON.stringify(config, null, 2)}\n\n1. Identify any contradictions between art style and tone.\n2. Provide three immersion suggestions.\n3. Provide a SUGGESTED_CHANGES JSON block if needed.\n\nREMINDER: Write all explanations, critiques, and suggestions in English.`;

    const { model } = await this.getGenerativeModel(
      AUDIT_REQUIREMENT,
      systemInstruction
    );

    try {
      const result = await model.generateContent(prompt);
      return (await result.response).text();
    } catch (error) {
      console.error('Gemini Audit Error:', error);
      return 'Error: Could not perform AI audit. Check API key and quota.';
    }
  }

}
