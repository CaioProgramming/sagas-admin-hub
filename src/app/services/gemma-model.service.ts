import { Injectable, inject } from '@angular/core';
import { RemoteConfigService } from './remote-config.service';

/** Mirrors `GemmaClient.ModelRequirement` on Android. */
export type ModelRequirement = 'TINY' | 'LOW' | 'MEDIUM' | 'HIGH';

export class ModelOutageError extends Error {
  constructor(
    readonly requirement: ModelRequirement,
    readonly model: string
  ) {
    super(`Model tier "${requirement}" (${model}) is disabled in Remote Config.`);
    this.name = 'ModelOutageError';
  }
}

type ModelTierEntry = string | { enabled?: boolean; model?: string };

@Injectable({ providedIn: 'root' })
export class GemmaModelService {
  private remoteConfig = inject(RemoteConfigService);

  /**
   * Resolves the Gemini model id for a tier — same rules as
   * `GemmaClient.modelName()` (Remote Config key `model_configs`).
   */
  async resolveModelName(requirement: ModelRequirement): Promise<string> {
    await this.remoteConfig.ensureActivated();
    const tierConfig =
      this.remoteConfig.getJson<Record<string, ModelTierEntry>>('model_configs') ??
      {};

    const config = tierConfig[requirement];

    if (typeof config === 'string') {
      return config.replace(/^models\//, '');
    }

    if (config && typeof config === 'object') {
      const enabled = config.enabled ?? true;
      const model = config.model;
      if (!enabled) {
        throw new ModelOutageError(requirement, model ?? 'unknown');
      }
      if (!model?.trim()) {
        throw new Error(
          `Model name not found in Remote Config for tier "${requirement}".`
        );
      }
      return model.replace(/^models\//, '');
    }

    throw new Error(
      `Invalid or missing model configuration for tier "${requirement}" in Remote Config (model_configs).`
    );
  }

  /** Temperature aligned with GemmaClient.generate for non-TINY/LOW tiers. */
  temperatureFor(requirement: ModelRequirement, randomness = 0.5): number {
    return requirement === 'TINY' || requirement === 'LOW' ? 0.1 : randomness;
  }
}
