import { Injectable } from '@angular/core';
import { GenreConfig } from '../models/genre-config';
import { GenreVisualConfig } from '../models/genre-visual-config';
import {
  ALL_GENRE_FIELD_SPECS,
  GenreFieldSpec,
  SFX_FIELD_SPEC,
  SOUL_FIELD_SPECS,
  VISUAL_FIELD_SPECS,
} from '../models/genre-field-spec';

export interface GenreFieldCheck {
  spec: GenreFieldSpec;
  present: boolean;
  displayValue: string;
  stagingKey: string;
}

export interface GenreHealthReport {
  health: number;
  soulHealth: number;
  visualHealth: number;
  sfxHealth: number;
  missingRequired: GenreFieldCheck[];
  checks: GenreFieldCheck[];
}

@Injectable({ providedIn: 'root' })
export class GenreHealthService {
  evaluate(
    genreId: string,
    genreName: string,
    soul: GenreConfig | null,
    visual: GenreVisualConfig | null,
    replySfxUrl: string
  ): GenreHealthReport {
    const checks: GenreFieldCheck[] = [];

    for (const spec of SOUL_FIELD_SPECS) {
      checks.push(this.checkSoulField(spec, genreId, soul));
    }
    for (const spec of VISUAL_FIELD_SPECS) {
      checks.push(this.checkVisualField(spec, genreId, visual));
    }
    checks.push(this.checkSfx(genreId, replySfxUrl));

    const required = checks.filter(c => c.spec.required);
    const presentRequired = required.filter(c => c.present);
    const health =
      required.length === 0
        ? 100
        : Math.floor((presentRequired.length / required.length) * 100);

    const soulRequired = checks.filter(
      c => c.spec.source === 'soul' && c.spec.required
    );
    const visualRequired = checks.filter(
      c => c.spec.source === 'visual' && c.spec.required
    );
    const sfxRequired = checks.filter(
      c => c.spec.source === 'sfx' && c.spec.required
    );

    return {
      health,
      soulHealth: this.sectionHealth(soulRequired),
      visualHealth: this.sectionHealth(visualRequired),
      sfxHealth: this.sectionHealth(sfxRequired),
      missingRequired: required.filter(c => !c.present),
      checks,
    };
  }

  private sectionHealth(checks: GenreFieldCheck[]): number {
    if (checks.length === 0) return 100;
    const ok = checks.filter(c => c.present).length;
    return Math.floor((ok / checks.length) * 100);
  }

  private checkSoulField(
    spec: GenreFieldSpec,
    genreId: string,
    soul: GenreConfig | null
  ): GenreFieldCheck {
    const raw = soul
      ? (soul as unknown as Record<string, unknown>)[spec.key]
      : undefined;
    return {
      spec,
      present: this.isPresent(raw, spec),
      displayValue: this.formatDisplay(raw, spec),
      stagingKey: `${genreId}_config`,
    };
  }

  private checkVisualField(
    spec: GenreFieldSpec,
    genreId: string,
    visual: GenreVisualConfig | null
  ): GenreFieldCheck {
    const raw = visual
      ? (visual as unknown as Record<string, unknown>)[spec.key]
      : undefined;
    return {
      spec,
      present: this.isPresent(raw, spec),
      displayValue: this.formatDisplay(raw, spec),
      stagingKey: `${genreId}_visual_config`,
    };
  }

  private checkSfx(genreId: string, replySfxUrl: string): GenreFieldCheck {
    const present = !!replySfxUrl?.trim();
    return {
      spec: SFX_FIELD_SPEC,
      present,
      displayValue: replySfxUrl?.trim() ?? '',
      stagingKey: 'reply_sfx_config',
    };
  }

  private isPresent(value: unknown, spec: GenreFieldSpec): boolean {
    if (value === null || value === undefined) return false;

    if (spec.valueType === 'json' || Array.isArray(value) || typeof value === 'object') {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value as object).length > 0;
    }

    if (typeof value === 'number') {
      if (spec.key === 'cornerSizeDp') return value > 0;
      return true;
    }

    if (typeof value === 'string') return value.trim().length > 0;

    return true;
  }

  private formatDisplay(value: unknown, spec: GenreFieldSpec): string {
    if (value === null || value === undefined) return '';
    if (spec.valueType === 'json' || typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }
}
