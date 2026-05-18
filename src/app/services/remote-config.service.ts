import { Injectable, inject } from '@angular/core';
import { getValue, fetchAndActivate } from 'firebase/remote-config';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {
  private firebaseService = inject(FirebaseService);

  private activatePromise: Promise<boolean> | null = null;
  private lastActivatedAt = 0;

  /**
   * Fetches and activates Remote Config once per interval unless forced.
   * Concurrent callers share the same in-flight promise.
   */
  async ensureActivated(force = false): Promise<boolean> {
    const minInterval =
      this.firebaseService.config.settings.minimumFetchIntervalMillis;
    const elapsed = Date.now() - this.lastActivatedAt;

    if (
      !force &&
      this.activatePromise &&
      this.lastActivatedAt > 0 &&
      elapsed < minInterval
    ) {
      return this.activatePromise;
    }

    this.activatePromise = fetchAndActivate(this.firebaseService.config)
      .then((activated) => {
        this.lastActivatedAt = Date.now();
        return activated;
      })
      .catch((error) => {
        console.error('RemoteConfig: Fetch failed', error);
        this.activatePromise = null;
        return false;
      });

    return this.activatePromise;
  }

  /** @deprecated Prefer ensureActivated() */
  async fetchAndActivate(): Promise<boolean> {
    return this.ensureActivated(true);
  }

  getString(key: string): string {
    return getValue(this.firebaseService.config, key).asString();
  }

  getBoolean(key: string): boolean {
    return getValue(this.firebaseService.config, key).asBoolean();
  }

  getNumber(key: string): number {
    return getValue(this.firebaseService.config, key).asNumber();
  }

  getJson<T>(key: string): T | null {
    const jsonString = this.getString(key);
    if (!jsonString || jsonString === '') return null;
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`RemoteConfig: Error parsing JSON for key "${key}"`, error);
      return null;
    }
  }
}
