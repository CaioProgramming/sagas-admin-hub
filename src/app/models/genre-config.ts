export interface CompanionConfig {
  tone: string;
  persona: string;
  conversationalStyle: string;
  interludeStyle: string;
}

export interface VariationConfig {
  name: string;
  description: string;
  artStyle?: string;
  renderingInstructions?: string;
  appearanceGuidelines?: string;
  conversationDirective?: string;
  criticalRules?: string;
}

export interface ShaderParams {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  softFocusRadius?: number;
  grainIntensity?: number;
}

export interface GenreConfig {
  ambientMusicUrl: string;
  artStyle: string;
  renderingInstructions: string;
  appearanceGuidelines: string;
  colorPalette: string;
  conversationDirective: string;
  nameDirective: string;
  criticalRules: string;
  criticalValidation: string;
  imageUrl: string;
  variations?: Record<string, VariationConfig>;
  companion?: CompanionConfig;
  iconAspectRatio?: string;
  coverAspectRatio?: string;
  primaryColor?: string;
  cornerSizeDp?: number;
  shaderParams?: ShaderParams;
  [key: string]: any; // Flexibility for extra fields
}

export const MANDATORY_GENRE_KEYS: (keyof GenreConfig)[] = [
  'imageUrl',
  'artStyle',
  'renderingInstructions',
  'appearanceGuidelines',
  'conversationDirective',
  'nameDirective',
  'criticalRules'
];
