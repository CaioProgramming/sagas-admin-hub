export interface GenreVisualConfig {
  primaryColor: string;
  iconColor: string;
  colorPalette: string[];
  cornerSizeDp: number;
  backgroundUrl: string;
  imageUrl: string;
  headerFontUrl?: string;
  bodyFontUrl?: string;
  vibrationPattern: number[];
  selectiveHighlight?: SelectiveHighlightConfig;
  shaderParams?: ShaderParamsConfig;
  colorTones?: ColorTonesConfig;
}

export interface SelectiveHighlightConfig {
  hueTolerance: number;
  saturationThreshold: number;
  lightnessThreshold: number;
  highlightSaturationBoost: number;
  highlightLightnessBoost: number;
  desaturationFactorNonTarget: number;
}

export interface ShaderParamsConfig {
  grainIntensity: number;
  bloomThreshold: number;
  bloomIntensity: number;
  bloomRadius: number;
  softFocusRadius: number;
  saturation: number;
  contrast: number;
  brightness: number;
  highlightTint: number[];
  shadowTint: number[];
  tintStrength: number;
  vignetteStrength: number;
  vignetteSoftness: number;
  pixelationBlockSize: number;
  colorTemperature: number;
}

export interface ColorTonesConfig {
  name: string;
  highlightTint: number[];
  shadowTint: number[];
  defaultTintStrength: number;
}
