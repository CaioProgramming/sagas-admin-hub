import { Injectable, inject } from '@angular/core';
import { RemoteConfigService } from './remote-config.service';
import { PromptBlueprint } from '../models/prompt-blueprint';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private remoteConfigService = inject(RemoteConfigService);

  /**
   * Replaces {key} placeholders in the template with values from the variables map.
   */
  buildPrompt(template: string, variables: Record<string, string>): string {
    let result = template;
    const placeholders = template.match(/\{(\w+)\}/g) || [];
    
    const uniquePlaceholders = [...new Set(placeholders.map(p => p.slice(1, -1)))];

    uniquePlaceholders.forEach(key => {
      const value = variables[key];
      if (value !== undefined) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      } else {
        console.warn(`PromptService: Variable "{${key}}" not found in variables map.`);
      }
    });

    return result;
  }

  /**
   * Fetches a blueprint from Remote Config and builds the final prompt string.
   */
  async buildRemotePrompt(
    remoteConfigKey: string,
    variables: Record<string, string> = {}
  ): Promise<string> {
    const blueprint = this.remoteConfigService.getJson<PromptBlueprint>(remoteConfigKey);

    if (!blueprint) {
      throw new Error(`PromptService: Blueprint not found for key: ${remoteConfigKey}`);
    }

    if (!blueprint.template) {
      throw new Error(`PromptService: Template is empty for key: ${remoteConfigKey}`);
    }

    const lines: string[] = [];

    if (blueprint.omitHeaders) {
      if (blueprint.role) lines.push(blueprint.role);
      Object.values(blueprint.directives).forEach(d => lines.push(d));
      Object.values(blueprint.rules).forEach(r => lines.push(r));
      lines.push(this.buildPrompt(blueprint.template, variables));
    } else {
      // 1. Identity
      if (blueprint.role) {
        lines.push('# IDENTITY');
        lines.push(blueprint.role);
        lines.push('');
      }

      // 2. Directives
      if (Object.keys(blueprint.directives).length > 0) {
        lines.push('# MODULE DIRECTIVES');
        Object.entries(blueprint.directives).forEach(([key, value]) => {
          lines.push(`## ${key}`);
          lines.push(value);
        });
        lines.push('');
      }

      // 3. Rules
      if (Object.keys(blueprint.rules).length > 0) {
        lines.push('# RULES');
        Object.entries(blueprint.rules).forEach(([key, value]) => {
          lines.push(`## ${key}`);
          lines.push(value);
        });
        lines.push('');
      }

      // 4. Task
      lines.push('# TASK DEFINITION');
      lines.push(this.buildPrompt(blueprint.template, variables));
    }

    return lines.join('\n').trim();
  }
}
