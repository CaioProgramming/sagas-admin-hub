import { Injectable, inject, signal } from '@angular/core';
import { RemoteConfigService } from './remote-config.service';
import { GenreConfig } from '../models/genre-config';

@Injectable({
  providedIn: 'root'
})
export class GenreConfigService {
  private remoteConfigService = inject(RemoteConfigService);

  genres = signal<Record<string, GenreConfig>>({});
  isLoading = signal(false);

  /**
   * Syncs all genre configurations from the 'genre_visual_configs' flag.
   */
  async syncGenreConfigs() {
    this.isLoading.set(true);
    try {
      const genreIds = ['FANTASY', 'CYBERPUNK', 'HORROR', 'HEROES', 'CRIME', 'SHINOBI', 'SPACE_OPERA', 'COWBOY', 'PUNK_ROCK'];
      const configMap: Record<string, GenreConfig> = {};

      for (const id of genreIds) {
        const key = `${id.toLowerCase()}_visual_config`;
        const config = this.remoteConfigService.getJson<GenreConfig>(key);
        if (config) {
          configMap[id.toLowerCase()] = config;
        }
      }

      console.log('GenreConfigService: Fetched config map', configMap);
      this.genres.set(configMap);
    } catch (error) {
      console.error('GenreConfigService: Sync Failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Returns a specific genre config.
   */
  getGenreConfig(genreId: string): GenreConfig | null {
    return this.genres()[genreId] || null;
  }
}
