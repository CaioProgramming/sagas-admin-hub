export interface PromptBlueprint {
  role: string;
  template: string;
  directives: Record<string, string>;
  rules: Record<string, string>;
  omitHeaders?: boolean;
}
