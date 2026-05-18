/** Cross-reference: Android runtime usage vs admin hub validation. */
export type AndroidFieldUsage = 'active' | 'partial' | 'unused';

export interface GenreFieldUsageNote {
  key: string;
  config: 'soul' | 'visual' | 'sfx';
  androidUsage: AndroidFieldUsage;
  summary: string;
}

/** Mirrors audit of GenreConfig.kt + GenreVisualConfig.kt in sagas-android. */
export const GENRE_FIELD_USAGE: GenreFieldUsageNote[] = [
  { key: 'ambientMusicUrl', config: 'soul', androidUsage: 'active', summary: 'SagaThemeManager ambient cache' },
  { key: 'artStyle', config: 'soul', androidUsage: 'active', summary: 'ImagePrompts, validation rules' },
  { key: 'renderingInstructions', config: 'soul', androidUsage: 'active', summary: 'ImagePrompts, validation rules' },
  { key: 'appearanceGuidelines', config: 'soul', androidUsage: 'active', summary: 'Character + image prompts' },
  { key: 'colorPalette', config: 'soul', androidUsage: 'active', summary: 'AI image prompts (string, not UI palette)' },
  { key: 'iconAspectRatio', config: 'soul', androidUsage: 'active', summary: 'ImagenClient ICON' },
  { key: 'coverAspectRatio', config: 'soul', androidUsage: 'active', summary: 'ImagenClient COVER' },
  { key: 'variations', config: 'soul', androidUsage: 'partial', summary: 'New saga; conversationDirective in variation unused' },
  { key: 'criticalRules', config: 'soul', androidUsage: 'partial', summary: 'Variation merge only; prompts use ImageConfig.criticalRules' },
  { key: 'nameDirective', config: 'soul', androidUsage: 'unused', summary: 'Legacy — safe to remove from RC' },
  { key: 'criticalValidation', config: 'soul', androidUsage: 'unused', summary: 'Legacy — safe to remove from RC' },
  { key: 'companion', config: 'soul', androidUsage: 'unused', summary: 'Persona is {genre}_conversation_blueprint' },
  { key: 'imageUrl', config: 'soul', androidUsage: 'unused', summary: 'Use visual imageUrl instead' },
  { key: 'primaryColor', config: 'visual', androidUsage: 'active', summary: 'Theme, onboarding, UI chrome' },
  { key: 'iconColor', config: 'visual', androidUsage: 'active', summary: 'Icons, bubbles, word art' },
  { key: 'colorPalette', config: 'visual', androidUsage: 'active', summary: 'UI gradients (list)' },
  { key: 'vibrationPattern', config: 'visual', androidUsage: 'active', summary: 'Reply SFX haptics' },
  { key: 'shaderParams', config: 'visual', androidUsage: 'active', summary: 'Filters.effectForGenre' },
  { key: 'selectiveHighlight', config: 'visual', androidUsage: 'active', summary: 'Reader / share selective color' },
  { key: 'colorTones', config: 'visual', androidUsage: 'active', summary: 'Shader tint fallback' },
  { key: 'cornerSizeDp', config: 'visual', androidUsage: 'active', summary: 'Shapes corner radius' },
  { key: 'imageUrl', config: 'visual', androidUsage: 'active', summary: 'Genre tiles, onboarding art' },
  { key: 'headerFontUrl', config: 'visual', androidUsage: 'active', summary: 'GenreFontService + Theme' },
  { key: 'bodyFontUrl', config: 'visual', androidUsage: 'active', summary: 'GenreFontService + Theme + PDF' },
  { key: 'backgroundUrl', config: 'visual', androidUsage: 'unused', summary: 'Phase 2 stub — resolveBackground uses drawable' },
  { key: 'replySfxUrl', config: 'sfx', androidUsage: 'active', summary: 'Global reply_sfx_config map' },
];

export const LEGACY_FIELD_KEYS = new Set(
  GENRE_FIELD_USAGE.filter((f) => f.androidUsage === 'unused').map((f) => `${f.config}:${f.key}`)
);
