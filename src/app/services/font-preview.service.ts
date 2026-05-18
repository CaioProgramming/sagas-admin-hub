import { Injectable } from '@angular/core';

export type FontLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface LoadedGenreFont {
  family: string;
  status: FontLoadStatus;
  url: string;
  error?: string;
}

export interface GenreFontPreview {
  header: LoadedGenreFont;
  body: LoadedGenreFont;
}

@Injectable({
  providedIn: 'root'
})
export class FontPreviewService {
  private readonly cache = new Map<string, LoadedGenreFont>();

  async loadGenreFonts(
    genreId: string,
    headerFontUrl?: string,
    bodyFontUrl?: string
  ): Promise<GenreFontPreview> {
    const headerUrl = headerFontUrl?.trim() ?? '';
    const bodyUrl = bodyFontUrl?.trim() ?? '';

    const [header, body] = await Promise.all([
      headerUrl
        ? this.loadFont(`${genreId}-header`, headerUrl)
        : Promise.resolve(this.idleFont()),
      bodyUrl
        ? this.loadFont(`${genreId}-body`, bodyUrl)
        : Promise.resolve(this.idleFont()),
    ]);

    return { header, body };
  }

  private idleFont(): LoadedGenreFont {
    return { family: '', status: 'idle', url: '' };
  }

  private async loadFont(cacheKey: string, url: string): Promise<LoadedGenreFont> {
    const cached = this.cache.get(cacheKey);
    if (cached?.status === 'loaded' || cached?.status === 'loading') {
      if (cached.url === url) return cached;
    }

    const family = `genre-font-${this.hash(cacheKey)}`;
    const loading: LoadedGenreFont = { family, status: 'loading', url };
    this.cache.set(cacheKey, loading);

    try {
      const fontFace = new FontFace(family, `url("${url}")`);
      const loaded = await fontFace.load();
      document.fonts.add(loaded);
      const result: LoadedGenreFont = { family, status: 'loaded', url };
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const result: LoadedGenreFont = { family, status: 'error', url, error: message };
      this.cache.set(cacheKey, result);
      return result;
    }
  }

  private hash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
}
