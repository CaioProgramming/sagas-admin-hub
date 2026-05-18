import { Injectable } from '@angular/core';

const CACHE_NAME = 'sagas-admin-audio-v1';

/**
 * Fetches remote audio once, stores in Cache API + in-memory blob URLs for replay.
 */
@Injectable({ providedIn: 'root' })
export class AudioCacheService {
  private blobUrls = new Map<string, string>();
  private inflight = new Map<string, Promise<string>>();

  async resolvePlayableUrl(remoteUrl: string): Promise<string> {
    const url = remoteUrl.trim();
    if (!url) {
      throw new Error('Empty audio URL');
    }

    const mem = this.blobUrls.get(url);
    if (mem) return mem;

    const pending = this.inflight.get(url);
    if (pending) return pending;

    const task = this.fetchAndCache(url);
    this.inflight.set(url, task);
    try {
      return await task;
    } finally {
      this.inflight.delete(url);
    }
  }

  private async fetchAndCache(url: string): Promise<string> {
    let response: Response | undefined;

    if (typeof caches !== 'undefined') {
      try {
        const cache = await caches.open(CACHE_NAME);
        const hit = await cache.match(url);
        if (hit) {
          response = hit;
        } else {
          response = await fetch(url, { mode: 'cors', credentials: 'omit' });
          if (response.ok) {
            await cache.put(url, response.clone());
          }
        }
      } catch {
        response = undefined;
      }
    }

    if (!response) {
      response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch audio (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    this.blobUrls.set(url, objectUrl);
    return objectUrl;
  }

  revoke(url: string): void {
    const objectUrl = this.blobUrls.get(url);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.blobUrls.delete(url);
    }
  }
}
