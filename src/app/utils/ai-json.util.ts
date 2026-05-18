/** Rough port of Android `sanitizeAndExtractJsonString` for AIGeneration payloads. */
export function sanitizeAndExtractJson(raw: string): string {
  if (!raw?.trim()) return '';
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

export interface AIGeneration<T> {
  reasoning?: string;
  data: T;
}

export function parseAIGenerationString(
  accumulated: string
): AIGeneration<string> | null {
  try {
    const json = sanitizeAndExtractJson(accumulated);
    if (!json) return null;
    const parsed = JSON.parse(json) as AIGeneration<string>;
    if (parsed?.data == null) return null;
    return {
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      data:
        typeof parsed.data === 'string'
          ? parsed.data
          : String(parsed.data ?? ''),
    };
  } catch {
    return null;
  }
}
