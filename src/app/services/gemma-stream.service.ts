import { Injectable, inject } from '@angular/core';
import { secrets } from '../../environments/environment.secret';
import { RemoteConfigService } from './remote-config.service';
import { PromptService } from './prompt.service';
import {
  GemmaModelService,
  ModelRequirement,
} from './gemma-model.service';
import { parseAIGenerationString } from '../utils/ai-json.util';

export type StreamingState<T> =
  | { kind: 'reasoning'; chunk: string }
  | { kind: 'success'; data: T }
  | { kind: 'error'; message: string };

/**
 * Streaming + text helpers aligned with Android `GemmaClient` (Remote Config blueprints + model_configs).
 */
@Injectable({ providedIn: 'root' })
export class GemmaStreamService {
  private gemmaModel = inject(GemmaModelService);
  private remoteConfig = inject(RemoteConfigService);
  private promptService = inject(PromptService);

  async generateText(
    prompt: string,
    requirement: ModelRequirement = 'LOW',
    temperatureRandomness = 0.5
  ): Promise<string | null> {
    await this.remoteConfig.ensureActivated();
    const modelId = await this.gemmaModel.resolveModelName(requirement);
    const temperature = this.gemmaModel.temperatureFor(
      requirement,
      temperatureRandomness
    );

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${secrets.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature },
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message ?? res.statusText);
    }
    return (
      json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
    );
  }

  /**
   * Mirrors `GemmaClient.generateStreaming<String>` as used by `ImagenClient`
   * (useCore=false, HIGH, requireTranslation=false).
   */
  async *streamStringGeneration(
    taskPrompt: string,
    requirement: ModelRequirement = 'HIGH'
  ): AsyncGenerator<StreamingState<string>> {
    await this.remoteConfig.ensureActivated();
    const modelId = await this.gemmaModel.resolveModelName(requirement);
    const temperature = this.gemmaModel.temperatureFor(requirement);

    const corePrompt = this.promptService.buildRemotePrompt('core_blueprint', {
      language: 'English (United States)',
      type: 'String',
      structure: '"string"',
      formattingRule:
        'Respond using STRICTLY VALID JSON. Maintain escaping and UTF-8 encoding.',
    });

    const fullPrompt = `${taskPrompt}\n\n${corePrompt}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${secrets.geminiApiKey}`;

    let accumulated = '';
    let synthesisStarted = false;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        yield {
          kind: 'error',
          message: err?.error?.message ?? res.statusText,
        };
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        yield { kind: 'error', message: 'No response body from Gemini stream.' };
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (let line of lines) {
          line = line.trim();
          if (!line || line === '[DONE]') continue;
          if (line.startsWith('data:')) line = line.slice(5).trim();
          if (!line.startsWith('{')) continue;

          try {
            const partial = JSON.parse(line) as {
              candidates?: { content?: { parts?: { text?: string }[] } }[];
            };
            const chunk =
              partial.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (!chunk) continue;

            accumulated += chunk;
            yield { kind: 'reasoning', chunk: accumulated };

            const parsed = parseAIGenerationString(accumulated);
            if (parsed?.data && !synthesisStarted) {
              synthesisStarted = true;
            }
          } catch {
            /* partial SSE chunk */
          }
        }
      }

      const final = parseAIGenerationString(accumulated);
      if (final?.data?.trim()) {
        yield { kind: 'success', data: final.data.trim() };
      } else {
        yield {
          kind: 'error',
          message: 'Failed to parse final image prompt JSON from stream.',
        };
      }
    } catch (e) {
      yield {
        kind: 'error',
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
