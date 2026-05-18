import { Injectable, inject } from '@angular/core';
import { GenreBundle } from './genre-config.service';
import { ImageTestType } from './gemini.service';
import { RemoteConfigService } from './remote-config.service';
import { ImagePromptsService } from './image-prompts.service';
import { PromptService } from './prompt.service';
import { GemmaStreamService } from './gemma-stream.service';
import { ReasoningSynthesizerService } from './reasoning-synthesizer.service';
import { GemmaModelService } from './gemma-model.service';

const PORTRAIT_BRIEFS = [
  'Invent a never-before-seen protagonist: unique face, wardrobe, and expression native to this genre.',
  'Create an original anti-hero in a tense bust portrait — mid-breath before a decision.',
  'Design a mysterious stranger whose silhouette tells their backstory without words.',
  'Imagine a battle-worn veteran with one defining scar and one symbolic accessory.',
  'Conjure a young rebel whose eyes contradict their calm posture.',
];

const COVER_BRIEFS = [
  'Invent a vertical saga cover for a brand-new story — cliffhanger moment, no named characters.',
  'Design an epic chapter cover: environment dominates, tiny figures optional, maximum atmosphere.',
  'Create a cover for a secret ritual interrupted — light vs shadow as the hook.',
  'Imagine the calm before catastrophe — wide vista, genre-defining palette.',
  'Compose a cover where weather and architecture scream this genre without text.',
];

export type ImagenPromptStreamEvent =
  | { type: 'status'; message: string }
  | { type: 'reasoning'; chunk: string }
  | { type: 'success'; prompt: string }
  | { type: 'error'; message: string };

export interface ImagenPromptTestResult {
  synthesizedPrompt: string;
  imageType: ImageTestType;
  randomBrief: string;
  aspectRatio: string;
  modelId: string;
}

/**
 * Admin mirror of `ImagenClient.generateIntegratedImageStream` — prompt synthesis only (no bitmap).
 */
@Injectable({ providedIn: 'root' })
export class ImagenClientService {
  private remoteConfig = inject(RemoteConfigService);
  private imagePrompts = inject(ImagePromptsService);
  private promptService = inject(PromptService);
  private gemmaStream = inject(GemmaStreamService);
  private reasoningSynthesizer = inject(ReasoningSynthesizerService);
  private gemmaModel = inject(GemmaModelService);

  async runIntegratedPromptTest(
    bundle: GenreBundle,
    imageType: ImageTestType,
    onEvent?: (event: ImagenPromptStreamEvent) => void
  ): Promise<ImagenPromptTestResult> {
    await this.remoteConfig.ensureActivated();

    const soul = bundle.soul;
    if (!soul?.artStyle?.trim() || !soul.renderingInstructions?.trim()) {
      throw new Error('Soul config needs artStyle and renderingInstructions before testing.');
    }

    const randomBrief = this.pickRandom(
      imageType === 'ICON' ? PORTRAIT_BRIEFS : COVER_BRIEFS
    );
    const aspectRatio = this.resolveAspectRatio(bundle, imageType);
    const modelId = await this.gemmaModel.resolveModelName('HIGH');

    onEvent?.({ type: 'status', message: 'Building unified blueprint…' });

    const unifiedPrompt = this.imagePrompts.buildUnifiedImagePrompt(
      bundle.rcName,
      soul,
      imageType,
      randomBrief
    );

    const conversationStyle = this.promptService.buildRemotePrompt(
      `${bundle.id}_conversation_blueprint`
    );

    onEvent?.({ type: 'status', message: 'Streaming Gemma (HIGH)…' });

    let finalPrompt: string | null = null;
    let lastReasoning = '';
    let synthesisJob: Promise<void> | null = null;

    for await (const state of this.gemmaStream.streamStringGeneration(
      unifiedPrompt,
      'HIGH'
    )) {
      if (state.kind === 'reasoning') {
        lastReasoning = state.chunk;
        onEvent?.({ type: 'reasoning', chunk: state.chunk });

        if (lastReasoning.length > 50 && !synthesisJob) {
          synthesisJob = this.runSynthesisSidecar(
            lastReasoning,
            randomBrief,
            conversationStyle,
            bundle.rcName,
            onEvent
          );
        }
      } else if (state.kind === 'success') {
        if (lastReasoning.trim()) {
          await this.runSynthesisSidecar(
            lastReasoning,
            randomBrief,
            conversationStyle,
            bundle.rcName,
            onEvent
          );
        }
        finalPrompt = state.data;
        onEvent?.({ type: 'success', prompt: state.data });
        break;
      } else if (state.kind === 'error') {
        onEvent?.({ type: 'error', message: state.message });
        throw new Error(state.message);
      }
    }

    if (!finalPrompt?.trim()) {
      throw new Error('Prompt synthesis returned empty text.');
    }

    return {
      synthesizedPrompt: finalPrompt,
      imageType,
      randomBrief,
      aspectRatio,
      modelId,
    };
  }

  private async runSynthesisSidecar(
    reasoning: string,
    context: string,
    conversationStyle: string,
    genreRcName: string,
    onEvent?: (event: ImagenPromptStreamEvent) => void
  ): Promise<void> {
    const line = await this.reasoningSynthesizer.synthesizeReasoningLine(
      reasoning,
      context,
      conversationStyle,
      genreRcName
    );
    if (line) {
      onEvent?.({ type: 'reasoning', chunk: line });
    }
  }

  private resolveAspectRatio(bundle: GenreBundle, type: ImageTestType): string {
    const soul = bundle.soul;
    const imageConfig = this.remoteConfig.getJson<{
      typeConfigs?: Record<string, { aspectRatio?: string }>;
    }>('image_config');
    const typeConfig = imageConfig?.typeConfigs?.[type];

    if (type === 'ICON') {
      return (
        soul?.iconAspectRatio?.trim() ||
        typeConfig?.aspectRatio?.trim() ||
        '1:1'
      );
    }
    return (
      soul?.coverAspectRatio?.trim() ||
      typeConfig?.aspectRatio?.trim() ||
      '9:16'
    );
  }

  private pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}
