import { Injectable, signal, computed } from '@angular/core';
import { getAll, Value } from 'firebase/remote-config';
import { FirebaseService } from './firebase.service';
import { GenreConfig, MANDATORY_GENRE_KEYS } from '../models/genre-config';

export interface GenreSoul {
  id: string;
  name: string;
  config: Partial<GenreConfig>;
  health: number;
  missingKeys: string[];
  isFound: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BlueprintService {
  private genresSignal = signal<GenreSoul[]>([]);
  public genres = this.genresSignal.asReadonly();

  // Known definitive genres for the Sagas ecosystem
  private readonly GENRE_DEFINITIONS = [
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'horror', name: 'Horror' },
    { id: 'heroes', name: 'Heroes' },
    { id: 'crime', name: 'Crime' },
    { id: 'shinobi', name: 'Shinobi' },
    { id: 'space_opera', name: 'Space Opera' },
    { id: 'cowboy', name: 'Cowboy' },
    { id: 'punk_rock', name: 'Punk Rock' }
  ];

  constructor(private firebaseService: FirebaseService) {}

  syncBlueprints() {
    const allValues = getAll(this.firebaseService.config);
    const souls: GenreSoul[] = this.GENRE_DEFINITIONS.map(def => {
      const configKey = `${def.id}_config`;
      const visualKey = `${def.id}_visual_config`;
      
      let config: Partial<GenreConfig> = {};
      let isFound = false;

      // Extract main config
      if (allValues[configKey]) {
        try {
          config = JSON.parse(allValues[configKey].asString());
          isFound = true;
        } catch (e) {
          console.error(`Error parsing config for ${def.id}`, e);
        }
      }

      // Patch with visual config (canonical imageUrl source)
      if (allValues[visualKey]) {
        try {
          const visual = JSON.parse(allValues[visualKey].asString());
          if (visual.imageUrl) config.imageUrl = visual.imageUrl;
        } catch (e) {}
      }

      const missingKeys = MANDATORY_GENRE_KEYS.filter(k => !config[k as keyof GenreConfig]);
      const health = isFound ? Math.round(((MANDATORY_GENRE_KEYS.length - missingKeys.length) / MANDATORY_GENRE_KEYS.length) * 100) : 0;

      return {
        id: def.id,
        name: def.name,
        config,
        health,
        missingKeys,
        isFound
      };
    });

    this.genresSignal.set(souls);
  }

  getBlueprint(key: string): any {
    const allValues = getAll(this.firebaseService.config);
    if (allValues[key]) {
      try {
        return JSON.parse(allValues[key].asString());
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
