/** Mirrors Android Remote Config usage for soul / visual / global SFX. */
import type { AndroidFieldUsage } from './genre-field-usage';

export type GenreFieldSource = 'soul' | 'visual' | 'sfx';

export interface GenreFieldSpec {
  key: string;
  label: string;
  source: GenreFieldSource;
  /** Counts toward integrity % when true. */
  required: boolean;
  valueType?: 'string' | 'json' | 'number';
  /** Runtime usage in sagas-android (audit May 2026). */
  androidUsage?: AndroidFieldUsage;
}

/** `{genre}_config` — GenreConfig.kt */
export const SOUL_FIELD_SPECS: GenreFieldSpec[] = [
  { key: 'artStyle', label: 'Art Style', source: 'soul', required: true, androidUsage: 'active' },
  { key: 'renderingInstructions', label: 'Rendering Instructions', source: 'soul', required: true, androidUsage: 'active' },
  { key: 'appearanceGuidelines', label: 'Appearance Guidelines', source: 'soul', required: true, androidUsage: 'active' },
  { key: 'ambientMusicUrl', label: 'Ambient Music URL', source: 'soul', required: true, androidUsage: 'active' },
  { key: 'imageUrl', label: 'Cover Image URL (soul)', source: 'soul', required: false, androidUsage: 'unused' },
  { key: 'criticalRules', label: 'Critical Rules', source: 'soul', required: false, androidUsage: 'partial' },
  { key: 'colorPalette', label: 'AI Palette (text)', source: 'soul', required: false, androidUsage: 'active' },
  { key: 'nameDirective', label: 'Name Directive', source: 'soul', required: false, androidUsage: 'unused' },
  { key: 'criticalValidation', label: 'Critical Validation', source: 'soul', required: false, androidUsage: 'unused' },
  { key: 'iconAspectRatio', label: 'Icon Aspect Ratio', source: 'soul', required: false, androidUsage: 'active' },
  { key: 'coverAspectRatio', label: 'Cover Aspect Ratio', source: 'soul', required: false, androidUsage: 'active' },
];

/** `{genre}_visual_config` — GenreVisualConfig.kt */
export const VISUAL_FIELD_SPECS: GenreFieldSpec[] = [
  { key: 'primaryColor', label: 'Primary Color', source: 'visual', required: true, androidUsage: 'active' },
  { key: 'iconColor', label: 'Icon Color', source: 'visual', required: true, androidUsage: 'active' },
  {
    key: 'colorPalette',
    label: 'UI Color Palette',
    source: 'visual',
    required: true,
    valueType: 'json',
    androidUsage: 'active',
  },
  { key: 'imageUrl', label: 'Genre Image URL', source: 'visual', required: true, androidUsage: 'active' },
  {
    key: 'vibrationPattern',
    label: 'Haptics Pattern (ms)',
    source: 'visual',
    required: true,
    valueType: 'json',
    androidUsage: 'active',
  },
  { key: 'shaderParams', label: 'Shader Params', source: 'visual', required: false, valueType: 'json', androidUsage: 'active' },
  {
    key: 'selectiveHighlight',
    label: 'Selective Highlight',
    source: 'visual',
    required: false,
    valueType: 'json',
    androidUsage: 'active',
  },
  { key: 'colorTones', label: 'Color Tones', source: 'visual', required: false, valueType: 'json', androidUsage: 'active' },
  { key: 'cornerSizeDp', label: 'Corner Size (dp)', source: 'visual', required: false, valueType: 'number', androidUsage: 'active' },
  { key: 'backgroundUrl', label: 'Background URL', source: 'visual', required: false, androidUsage: 'unused' },
];

export const SFX_FIELD_SPEC: GenreFieldSpec = {
  key: 'replySfxUrl',
  label: 'Reply SFX URL',
  source: 'sfx',
  required: true,
  androidUsage: 'active',
};

export const ALL_GENRE_FIELD_SPECS: GenreFieldSpec[] = [
  ...SOUL_FIELD_SPECS,
  ...VISUAL_FIELD_SPECS,
  SFX_FIELD_SPEC,
];
