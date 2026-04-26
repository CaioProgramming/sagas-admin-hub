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
  reviewerStrictness?: string;
  iconAspectRatio?: string;
  coverAspectRatio?: string;
  companion?: CompanionConfig;
  variations?: Record<string, VariationConfig>;
}

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

export const MANDATORY_GENRE_KEYS = [
  'ambientMusicUrl', 'artStyle', 'renderingInstructions', 'appearanceGuidelines',
  'colorPalette', 'conversationDirective', 'nameDirective', 'criticalRules',
  'criticalValidation', 'imageUrl'
];
