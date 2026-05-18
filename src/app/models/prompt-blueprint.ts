export interface PromptBlueprint {
  title?: string;
  role?: string;
  template: string;
  directives?: Record<string, string>;
  rules?: Record<string, string>;
  examples?: Record<string, string>[];
  omitHeaders?: boolean;
}
