import { Injectable, inject } from '@angular/core';
import { GenreConfig } from '../models/genre-config';
import { ImageConfig } from '../models/image-config';
import { PromptService } from './prompt.service';
import { RemoteConfigService } from './remote-config.service';
import { ImageTestType } from './gemini.service';

export interface UnifiedImageArgs {
  genre: string;
  context: string;
  imageType: string;
  artStyle: string;
  appearanceGuidelines: string;
  colorPalette: string;
  validationRules: string;
  criticalRules: string;
  renderingInstructions: string;
  aspectRatio: string;
}

@Injectable({ providedIn: 'root' })
export class ImagePromptsService {
  private promptService = inject(PromptService);
  private remoteConfig = inject(RemoteConfigService);

  buildValidationRules(genreName: string, config: GenreConfig): string {
    return [
      `**${genreName} GENRE SOUL (Reviewer Mandate):**`,
      `- Narrative Essence: ${config.artStyle}`,
      `- Mandatory Palette: ${config.colorPalette}`,
      '',
      '**RENDERING INSTRUCTIONS (The Technical Goal):**',
      config.renderingInstructions,
      '',
      '**CRITICAL FOCUS AREAS:**',
      '1. SCENE NATURALITY: Ensure lighting and atmosphere are organic to the narrative context. Ban hard-injected digital overlays or unnatural light bars on faces.',
      '2. ENVIRONMENT INTEGRITY: The setting must be vivid and match the story context. No vague or empty backgrounds.',
      "3. CHARACTER FIDELITY: Ensure all physical traits (skin, hair, eyes) match the '#### SUBJECTS DETAILS' perfectly.",
      '',
      '**TECHNICAL ALIGNMENT:**',
      "- The Artist must describe visuals that COMPLEMENT the Rendering Instructions. If the medium is SUMI-E, the description should favor 'void' and 'strokes'. If it is COMIC, it should favor 'spot blacks' and 'sharp ink'.",
    ].join('\n');
  }

  buildUnifiedImagePrompt(
    genreRcName: string,
    config: GenreConfig,
    imageType: ImageTestType,
    context: string
  ): string {
    const imageConfig =
      this.remoteConfig.getJson<ImageConfig>('image_config') ?? {};
    const typeKey = imageType;
    const typeConfig = imageConfig.typeConfigs?.[typeKey];

    const aspectRatio =
      imageType === 'ICON'
        ? config.iconAspectRatio?.trim() ||
          typeConfig?.aspectRatio?.trim() ||
          ''
        : config.coverAspectRatio?.trim() ||
          typeConfig?.aspectRatio?.trim() ||
          '';

    const args: UnifiedImageArgs = {
      genre: genreRcName,
      context,
      imageType: imageType.replace('_', ' '),
      artStyle: config.artStyle,
      appearanceGuidelines: config.appearanceGuidelines,
      colorPalette: config.colorPalette,
      validationRules: this.buildValidationRules(genreRcName, config),
      criticalRules: imageConfig.criticalRules ?? config.criticalRules ?? '',
      renderingInstructions: config.renderingInstructions,
      aspectRatio,
    };

    const variables: Record<string, string> = {
      genre: args.genre,
      context: args.context,
      imageType: args.imageType,
      artStyle: args.artStyle,
      appearanceGuidelines: args.appearanceGuidelines,
      colorPalette: args.colorPalette,
      validationRules: args.validationRules,
      criticalRules: args.criticalRules,
      renderingInstructions: args.renderingInstructions,
      aspectRatio: args.aspectRatio,
    };

    const remoteConfigKey = `unified_${imageType.toLowerCase()}_blueprint`;
    return this.promptService.buildRemotePrompt(remoteConfigKey, variables);
  }
}
