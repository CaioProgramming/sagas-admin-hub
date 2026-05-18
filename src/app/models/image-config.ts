export interface ImageTypeConfig {
  director?: string;
  artist?: string;
  reviewer?: string;
  aspectRatio?: string;
}

export interface ImageConfig {
  criticalRules?: string;
  typeConfigs?: Record<string, ImageTypeConfig>;
}
