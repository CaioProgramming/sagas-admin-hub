import { Injectable, inject } from '@angular/core';
import { RemoteConfigService } from './remote-config.service';
import { PromptService } from './prompt.service';
import { GemmaStreamService } from './gemma-stream.service';

interface ReasoningFallbacks {
  default?: string[];
  genres?: Record<string, string[]>;
}

/**
 * Port of Android `ReasoningSynthesizerService` (display-only reasoning lines during image prompt stream).
 */
@Injectable({ providedIn: 'root' })
export class ReasoningSynthesizerService {
  private promptService = inject(PromptService);
  private remoteConfig = inject(RemoteConfigService);
  private gemmaStream = inject(GemmaStreamService);

  private static readonly REASONING_SYNTHESIZER_BLUEPRINT =
    'reasoning_synthesizer_blueprint';
  private static readonly REASONING_FALLBACKS_KEY = 'reasoning_fallbacks';

  sanitizeReasoning(text: string): string {
    return text
      .replace(/\{[^}]*\}|\[[^\]]*\]/g, '')
      .replace(/"\w+"\s*:\s*"[^"]*"/g, '')
      .replace(/"\w+"\s*:\s*[^,}]*/g, '')
      .replace(/[,{}:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async synthesizeReasoningLine(
    reasoning: string,
    context: string,
    conversationStyle: string | null,
    genreRcName: string | null
  ): Promise<string | null> {
    try {
      const style =
        conversationStyle?.trim() ||
        this.promptService.buildRemotePrompt('onboarding_default_role');

      const sanitized = this.sanitizeReasoning(reasoning).slice(-400);
      const prompt = this.promptService.buildRemotePrompt(
        ReasoningSynthesizerService.REASONING_SYNTHESIZER_BLUEPRINT,
        {
          context,
          thoughtStream: sanitized,
          conversationStyle: style,
          language: 'English (United States)',
        }
      );

      const translation = await this.gemmaStream.generateText(prompt, 'LOW', 1);
      if (translation?.trim()) {
        return translation.trim().replace(/^"|"$/g, '');
      }
      return this.pickFallback(genreRcName);
    } catch {
      return this.pickFallback(genreRcName);
    }
  }

  private pickFallback(genreRcName: string | null): string | null {
    const fallbacks = this.remoteConfig.getJson<ReasoningFallbacks>(
      ReasoningSynthesizerService.REASONING_FALLBACKS_KEY
    );
    const pool =
      (genreRcName && fallbacks?.genres?.[genreRcName]) ||
      fallbacks?.default ||
      [];
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
