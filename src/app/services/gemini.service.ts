import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { secrets } from '../../environments/environment.secret';
import { FirebaseService } from './firebase.service';
import { getAll } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private firebaseService = inject(FirebaseService);
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(secrets.geminiApiKey);
  }

  private getModel(requirement: 'TINY' | 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): GenerativeModel {
    const allValues = getAll(this.firebaseService.config);
    let modelName = 'gemini-1.5-pro'; // Fallback

    if (allValues['model_tier_config']) {
      try {
        const tierConfig = JSON.parse(allValues['model_tier_config'].asString());
        modelName = tierConfig[requirement] || modelName;
      } catch (e) {
        console.warn('Failed to parse model_tier_config, using fallback', e);
      }
    }

    // Sanitize model name (remove 'models/' prefix if present, as SDK adds it or expects specific format)
    const formattedModel = modelName.replace('models/', '');

    return this.genAI.getGenerativeModel({ 
        model: formattedModel,
        systemInstruction: "You are the 'Sagas Soul Auditor'. Analyze 'Genre Configurations' for consistency and evocative power. IMPORTANT: Always include a JSON block at the end of your response with the key 'SUGGESTED_CHANGES' containing improved versions of 'renderingInstructions' and 'conversationDirective' if changes are needed. Format: ```json { \"SUGGESTED_CHANGES\": { \"renderingInstructions\": \"...\", \"conversationDirective\": \"...\" } } ```"
    });
  }

  async auditGenre(genreName: string, config: any): Promise<string> {
    const model = this.getModel('HIGH');
    const prompt = `Analyze the following configuration for the genre '${genreName}':\n\n${JSON.stringify(config, null, 2)}\n\n1. Identify any contradictions between the art style and tone.\n2. Provide 3 narrative suggestions to make the genre feel more immersive.\n3. Provide the 'SUGGESTED_CHANGES' JSON block with optimized instructions.`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Audit Error:', error);
      return `Error: Could not perform AI audit using model. Check API key and quota.`;
    }
  }
}
