import { Injectable, inject } from '@angular/core';
import { RemoteConfigService } from './remote-config.service';
import { PromptBlueprint } from '../models/prompt-blueprint';

@Injectable({ providedIn: 'root' })
export class PromptService {
  private remoteConfig = inject(RemoteConfigService);

  buildPrompt(template: string, variables: Record<string, string>): string {
    let result = template;
    const keys = [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
    for (const key of keys) {
      const value = variables[key];
      if (value != null) {
        result = result.replaceAll(`{${key}}`, value);
      } else {
        console.warn(`PromptService: missing variable {${key}}`);
      }
    }
    return result;
  }

  buildRemotePrompt(
    remoteConfigKey: string,
    variables: Record<string, string> = {}
  ): string {
    const blueprint = this.remoteConfig.getJson<PromptBlueprint>(remoteConfigKey);
    if (!blueprint?.template?.trim()) {
      throw new Error(
        `Prompt template not found for Remote Config key: ${remoteConfigKey}`
      );
    }

    if (blueprint.omitHeaders) {
      const parts: string[] = [];
      if (blueprint.role?.trim()) parts.push(blueprint.role);
      Object.values(blueprint.directives ?? {}).forEach((d) => parts.push(d));
      Object.values(blueprint.rules ?? {}).forEach((r) => parts.push(r));
      parts.push(this.buildPrompt(blueprint.template, variables));
      return parts.join('\n').trim();
    }

    const sections: string[] = [];
    if (blueprint.role?.trim()) {
      sections.push('# IDENTITY', blueprint.role, '');
    }
    if (blueprint.directives && Object.keys(blueprint.directives).length) {
      sections.push('# MODULE DIRECTIVES');
      for (const [key, value] of Object.entries(blueprint.directives)) {
        sections.push(`## ${key}`, value);
      }
      sections.push('');
    }
    if (blueprint.rules && Object.keys(blueprint.rules).length) {
      sections.push('# RULES');
      for (const [key, value] of Object.entries(blueprint.rules)) {
        sections.push(`## ${key}`, value);
      }
      sections.push('');
    }
    if (blueprint.examples?.length) {
      sections.push('# FEW-SHOT EXAMPLES');
      blueprint.examples.forEach((ex, i) => {
        sections.push(`## EXAMPLE ${i + 1}`, JSON.stringify(ex, null, 2));
      });
      sections.push('');
    }
    sections.push(
      '# TASK DEFINITION',
      this.buildPrompt(blueprint.template, variables)
    );
    return sections.join('\n').trim();
  }
}
