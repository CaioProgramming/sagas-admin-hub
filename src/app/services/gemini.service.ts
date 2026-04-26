import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { secrets } from '../../environments/environment.secret';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(secrets.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: "You are the 'Sagas Soul Auditor'. Your job is to analyze 'Genre Configurations' for an AI-powered adventure game. You look for contradictions in rendering instructions, verify if the tone of voice matches the art style, and suggest improvements to make prompts more evocative and consistent. Always return suggestions in a structured format."
    });
  }

  async auditGenre(genreName: string, config: any): Promise<string> {
    const prompt = `Analyze the following configuration for the genre '${genreName}':\n\n${JSON.stringify(config, null, 2)}\n\nIdentify any contradictions and suggest 3 ways to improve the 'renderingInstructions' and 'conversationDirective'.`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Audit Error:', error);
      return "Error: Could not perform AI audit. Check API key and quota.";
    }
  }
}
