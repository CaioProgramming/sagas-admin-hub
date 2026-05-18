import { Injectable, inject, signal } from '@angular/core';
import { RemoteConfigService } from './remote-config.service';
import { GenreConfig } from '../models/genre-config';
import { GenreVisualConfig } from '../models/genre-visual-config';

export interface GenreBundle {
  id: string;
  rcName: string;
  soul: GenreConfig | null;
  visual: GenreVisualConfig | null;
  replySfxUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class GenreConfigService {
  private remoteConfigService = inject(RemoteConfigService);

  genres = signal<Record<string, GenreBundle>>({});
  isLoading = signal(false);

  private readonly genreIds = [
    'FANTASY',
    'CYBERPUNK',
    'HORROR',
    'HEROES',
    'CRIME',
    'SHINOBI',
    'SPACE_OPERA',
    'COWBOY',
    'PUNK_ROCK',
  ];

  async syncGenreConfigs() {
    this.isLoading.set(true);
    try {
      const sfxMap =
        this.remoteConfigService.getJson<Record<string, string>>('reply_sfx_config') ??
        {};
      const configMap: Record<string, GenreBundle> = {};

      for (const rcName of this.genreIds) {
        const id = rcName.toLowerCase();
        const soulKey = `${id}_config`;
        const visualKey = `${id}_visual_config`;
        const soul = this.remoteConfigService.getJson<GenreConfig>(soulKey);
        const visual = this.remoteConfigService.getJson<GenreVisualConfig>(visualKey);

        if (soul || visual) {
          configMap[id] = {
            id,
            rcName,
            soul,
            visual,
            replySfxUrl: sfxMap[rcName] ?? sfxMap['DEFAULT'] ?? '',
          };
        }
      }

      this.genres.set(configMap);
    } catch (error) {
      console.error('GenreConfigService: Sync Failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getGenreBundle(genreId: string): GenreBundle | null {
    return this.genres()[genreId] ?? null;
  }

  /** Cover / card image: visual first, then soul. */
  resolveImageUrl(bundle: GenreBundle): string {
    return (
      bundle.visual?.imageUrl?.trim() ||
      bundle.soul?.imageUrl?.trim() ||
      ''
    );
  }

  /** @deprecated Use getGenreBundle */
  getGenreConfig(genreId: string): (GenreConfig & GenreVisualConfig) | null {
    const bundle = this.getGenreBundle(genreId);
    if (!bundle) return null;
    return { ...(bundle.soul ?? {}), ...(bundle.visual ?? {}) } as GenreConfig &
      GenreVisualConfig;
  }
}
