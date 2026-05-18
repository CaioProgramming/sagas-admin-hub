import { Injectable, inject } from '@angular/core';
import { AudioCacheService } from './audio-cache.service';

export interface WaveformData {
  peaks: number[];
  durationSec: number;
  cachedUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AudioWaveformService {
  private cache = inject(AudioCacheService);
  private waveformCache = new Map<string, WaveformData>();

  async analyze(url: string, barCount = 80): Promise<WaveformData> {
    const key = `${url}::${barCount}`;
    const hit = this.waveformCache.get(key);
    if (hit) return hit;

    const cachedUrl = await this.cache.resolvePlayableUrl(url);
    const ctx = new AudioContext();

    try {
      const res = await fetch(cachedUrl);
      const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
      const channel = buffer.getChannelData(0);
      const block = Math.max(1, Math.floor(channel.length / barCount));
      const peaks: number[] = [];

      for (let i = 0; i < barCount; i++) {
        let max = 0;
        const start = i * block;
        const end = Math.min(channel.length, start + block);
        for (let j = start; j < end; j++) {
          max = Math.max(max, Math.abs(channel[j]));
        }
        peaks.push(max);
      }

      const maxPeak = Math.max(...peaks, 0.001);
      const normalized = peaks.map((p) => p / maxPeak);

      const data: WaveformData = {
        peaks: normalized,
        durationSec: buffer.duration,
        cachedUrl,
      };
      this.waveformCache.set(key, data);
      return data;
    } finally {
      await ctx.close();
    }
  }

  clear(url: string): void {
    for (const key of [...this.waveformCache.keys()]) {
      if (key.startsWith(url)) {
        this.waveformCache.delete(key);
      }
    }
  }
}
