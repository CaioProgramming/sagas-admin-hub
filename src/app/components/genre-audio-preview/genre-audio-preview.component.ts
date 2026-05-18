import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StagingService } from '../../services/staging.service';
import { AudioWaveformService, WaveformData } from '../../services/audio-waveform.service';

interface TrackUi {
  loading: boolean;
  error: string | null;
  waveform: WaveformData | null;
  playing: boolean;
  progress: number;
  showUrl: boolean;
}

@Component({
  selector: 'app-genre-audio-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="audio-panel" [style.--c1]="themeColors[0]" [style.--c2]="themeColors[1] ?? themeColors[0]">
      <div class="panel-head">
        <span class="label">Audio</span>
        <span class="hint">Cached waveform preview</span>
      </div>

      @if (ambientMusicUrl.trim()) {
        <div class="player" [class.playing]="ambientState().playing">
          <div class="player-head">
            <span class="track-title">Ambient</span>
            @if (ambientState().waveform) {
              <span class="duration">
                {{ formatTime(ambientState().progress * ambientState().waveform!.durationSec) }}
                / {{ formatTime(ambientState().waveform!.durationSec) }}
              </span>
            }
          </div>
          <div class="wave-wrap" (click)="seekFromClick($event, 'ambient')">
            @if (ambientState().loading) {
              <div class="wave-placeholder">Loading waveform…</div>
            } @else if (ambientState().error) {
              <div class="wave-error">{{ ambientState().error }}</div>
            } @else {
              <canvas #ambientCanvas class="wave-canvas" height="56"></canvas>
            }
            <button
              type="button"
              class="play-fab"
              [disabled]="ambientState().loading || !!ambientState().error"
              (click)="toggle('ambient'); $event.stopPropagation()"
            >
              {{ ambientState().playing ? '❚❚' : '▶' }}
            </button>
          </div>
          <button type="button" class="url-toggle" (click)="toggleUrl('ambient')">
            {{ ambientState().showUrl ? 'Hide URL' : 'Edit URL' }}
          </button>
          @if (ambientState().showUrl) {
            <input
              class="url-input"
              type="url"
              [value]="ambientMusicUrl"
              (blur)="onUrlBlur('ambient', $any($event.target).value)"
            />
          }
        </div>
      }

      @if (replySfxUrl.trim()) {
        <div class="player" [class.playing]="sfxState().playing">
          <div class="player-head">
            <span class="track-title">Reply SFX</span>
            @if (sfxState().waveform) {
              <span class="duration">
                {{ formatTime(sfxState().progress * sfxState().waveform!.durationSec) }}
                / {{ formatTime(sfxState().waveform!.durationSec) }}
              </span>
            }
          </div>
          <div class="wave-wrap" (click)="seekFromClick($event, 'sfx')">
            @if (sfxState().loading) {
              <div class="wave-placeholder">Loading waveform…</div>
            } @else if (sfxState().error) {
              <div class="wave-error">{{ sfxState().error }}</div>
            } @else {
              <canvas #sfxCanvas class="wave-canvas" height="56"></canvas>
            }
            <button
              type="button"
              class="play-fab"
              [disabled]="sfxState().loading || !!sfxState().error"
              (click)="toggle('sfx'); $event.stopPropagation()"
            >
              {{ sfxState().playing ? '❚❚' : '▶' }}
            </button>
          </div>
          <button type="button" class="url-toggle" (click)="toggleUrl('sfx')">
            {{ sfxState().showUrl ? 'Hide URL' : 'Edit URL' }}
          </button>
          @if (sfxState().showUrl) {
            <input
              class="url-input"
              type="url"
              [value]="replySfxUrl"
              (blur)="onUrlBlur('sfx', $any($event.target).value)"
            />
          }
        </div>
      }

      @if (!ambientMusicUrl.trim() && !replySfxUrl.trim()) {
        <p class="empty">No audio URLs configured</p>
      }

      @if (vibrationPattern?.length) {
        <div class="haptics-row">
          <span>{{ vibrationPattern!.length }} haptic steps</span>
          <button type="button" class="chip" [disabled]="!canVibrate" (click)="playHaptics()">
            {{ canVibrate ? 'Test haptics' : 'N/A' }}
          </button>
        </div>
      }

      <audio #ambientAudio preload="none" class="sr-only"></audio>
      <audio #sfxAudio preload="none" class="sr-only"></audio>
    </section>
  `,
  styles: [`
    .audio-panel {
      --c1: #8b2635;
      --c2: #5e1a24;
      padding: 0.85rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .panel-head {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.45);
    }

    .hint {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.32);
    }

    .player {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .player-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .track-title {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.55);
    }

    .duration {
      font-size: 0.62rem;
      font-variant-numeric: tabular-nums;
      color: rgba(255, 255, 255, 0.4);
    }

    .wave-wrap {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      min-height: 56px;
      cursor: pointer;
      background: linear-gradient(135deg, var(--c1) 0%, var(--c2) 100%);
      box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.25);
    }

    .wave-canvas {
      width: 100%;
      height: 56px;
      display: block;
    }

    .wave-placeholder,
    .wave-error {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.75);
    }

    .wave-error {
      color: #fecaca;
      padding: 0 0.75rem;
      text-align: center;
    }

    .play-fab {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(8px);
      color: #fff;
      font-size: 0.7rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .wave-wrap:hover .play-fab,
    .player.playing .play-fab {
      opacity: 1;
    }

    .url-toggle {
      align-self: flex-start;
      font-size: 0.6rem;
      color: rgba(255, 255, 255, 0.4);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }

    .url-input {
      width: 100%;
      padding: 0.4rem 0.5rem;
      font-size: 0.65rem;
      font-family: 'Fira Code', monospace;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.25);
      color: rgba(255, 255, 255, 0.65);
    }

    .empty {
      margin: 0;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.35);
    }

    .haptics-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.45);
    }

    .chip {
      font-size: 0.62rem;
      padding: 0.25rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
    }

    .sr-only {
      position: absolute;
      width: 0;
      height: 0;
      opacity: 0;
      pointer-events: none;
    }
  `],
})
export class GenreAudioPreviewComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @Input({ required: true }) genreId!: string;
  @Input() genreRcName = '';
  @Input() ambientMusicUrl = '';
  @Input() replySfxUrl = '';
  @Input() vibrationPattern: number[] | null = null;
  @Input() themeColors: string[] = ['#8b2635', '#e91e63'];

  @ViewChild('ambientCanvas') ambientCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('sfxCanvas') sfxCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('ambientAudio') ambientAudio?: ElementRef<HTMLAudioElement>;
  @ViewChild('sfxAudio') sfxAudio?: ElementRef<HTMLAudioElement>;

  ambientState = signal<TrackUi>(this.emptyTrack());
  sfxState = signal<TrackUi>(this.emptyTrack());
  canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  private staging = inject(StagingService);
  private waveformService = inject(AudioWaveformService);
  private rafId: number | null = null;
  private activeTrack: 'ambient' | 'sfx' | null = null;
  /** Bumps when playback should abort (pause, reload, destroy). */
  private playGeneration = 0;
  private loadGeneration = 0;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    void this.loadTracks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const urlsChanged =
      !!changes['ambientMusicUrl'] ||
      !!changes['replySfxUrl'] ||
      !!changes['genreId'];

    if (urlsChanged) {
      this.stopPlayback();
      if (this.viewReady) {
        void this.loadTracks();
      }
      return;
    }

    if (changes['themeColors']) {
      this.redraw('ambient');
      this.redraw('sfx');
    }
  }

  ngOnDestroy(): void {
    this.stopPlayback();
  }

  formatTime(sec: number): string {
    if (!Number.isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  toggleUrl(id: 'ambient' | 'sfx'): void {
    const sig = id === 'ambient' ? this.ambientState : this.sfxState;
    sig.update((s) => ({ ...s, showUrl: !s.showUrl }));
  }

  toggle(id: 'ambient' | 'sfx'): void {
    const state = id === 'ambient' ? this.ambientState() : this.sfxState();
    if (state.playing) {
      this.pause(id);
      return;
    }
    void this.play(id);
  }

  seekFromClick(ev: MouseEvent, id: 'ambient' | 'sfx'): void {
    const state = id === 'ambient' ? this.ambientState() : this.sfxState();
    if (!state.waveform) return;
    const el = ev.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
    const audio = this.audioEl(id);
    if (audio && state.waveform) {
      audio.currentTime = ratio * state.waveform.durationSec;
      this.updateProgress(id);
      this.redraw(id);
    }
  }

  playHaptics(): void {
    if (!this.canVibrate || !this.vibrationPattern?.length) return;
    navigator.vibrate(this.vibrationPattern);
  }

  onUrlBlur(id: 'ambient' | 'sfx', value: string): void {
    const trimmed = value.trim();
    if (id === 'ambient') {
      if (trimmed === this.ambientMusicUrl.trim()) return;
      const key = `${this.genreId}_config`;
      const existing = this.staging.getDraftJson<Record<string, unknown>>(key) ?? {};
      this.staging.updateDraft(key, JSON.stringify({ ...existing, ambientMusicUrl: trimmed }));
    } else {
      if (trimmed === this.replySfxUrl.trim()) return;
      const map =
        this.staging.getDraftJson<Record<string, string>>('reply_sfx_config') ?? {};
      const rcName = this.genreRcName || this.genreId.toUpperCase();
      this.staging.updateDraft(
        'reply_sfx_config',
        JSON.stringify({ ...map, [rcName]: trimmed })
      );
    }
  }

  private async loadTracks(): Promise<void> {
    const gen = ++this.loadGeneration;
    if (!this.ambientMusicUrl.trim()) {
      this.ambientState.set(this.emptyTrack());
    } else {
      await this.loadWaveform('ambient', this.ambientMusicUrl, gen);
    }
    if (!this.replySfxUrl.trim()) {
      this.sfxState.set(this.emptyTrack());
    } else {
      await this.loadWaveform('sfx', this.replySfxUrl, gen);
    }
  }

  private async loadWaveform(
    id: 'ambient' | 'sfx',
    url: string,
    gen = this.loadGeneration
  ): Promise<void> {
    const sig = id === 'ambient' ? this.ambientState : this.sfxState;
    sig.set({ ...this.emptyTrack(), loading: true });

    try {
      const waveform = await this.waveformService.analyze(url);
      if (gen !== this.loadGeneration) return;
      sig.set({ ...this.emptyTrack(), waveform });
      setTimeout(() => this.redraw(id), 0);
    } catch (e) {
      if (gen !== this.loadGeneration) return;
      sig.set({
        ...this.emptyTrack(),
        error: e instanceof Error ? e.message : 'Could not load audio',
      });
    }
  }

  private async play(id: 'ambient' | 'sfx'): Promise<void> {
    const gen = ++this.playGeneration;
    const other: 'ambient' | 'sfx' = id === 'ambient' ? 'sfx' : 'ambient';
    this.pause(other, false);

    const state = id === 'ambient' ? this.ambientState() : this.sfxState();
    if (!state.waveform) return;

    const audio = this.audioEl(id);
    if (!audio) return;

    const sig = id === 'ambient' ? this.ambientState : this.sfxState;

    try {
      if (audio.src !== state.waveform.cachedUrl) {
        audio.src = state.waveform.cachedUrl;
      }
      audio.load();
      await this.waitForCanPlay(audio);
      if (gen !== this.playGeneration) return;

      const seekTo = state.progress * state.waveform.durationSec;
      if (Number.isFinite(seekTo) && seekTo > 0) {
        audio.currentTime = seekTo;
      }

      await audio.play();
      if (gen !== this.playGeneration) {
        audio.pause();
        return;
      }

      this.activeTrack = id;
      sig.update((s) => ({ ...s, playing: true, error: null }));
      this.startProgressLoop();
    } catch (e) {
      if (this.isAbortError(e)) return;
      if (gen !== this.playGeneration) return;
      sig.update((s) => ({
        ...s,
        playing: false,
        error: e instanceof Error ? e.message : 'Playback failed',
      }));
    }
  }

  private waitForCanPlay(audio: HTMLAudioElement): Promise<void> {
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('Audio element failed to load cached file'));
      };
      const cleanup = () => {
        audio.removeEventListener('canplay', onReady);
        audio.removeEventListener('error', onError);
      };
      audio.addEventListener('canplay', onReady, { once: true });
      audio.addEventListener('error', onError, { once: true });
    });
  }

  private isAbortError(e: unknown): boolean {
    return (
      e instanceof DOMException &&
      (e.name === 'AbortError' || e.message.toLowerCase().includes('aborted'))
    );
  }

  private pause(id: 'ambient' | 'sfx', bumpGeneration = true): void {
    if (bumpGeneration) {
      this.playGeneration++;
    }
    this.audioEl(id)?.pause();
    const sig = id === 'ambient' ? this.ambientState : this.sfxState;
    sig.update((s) => ({ ...s, playing: false }));
    if (this.activeTrack === id) {
      this.activeTrack = null;
      this.stopProgressLoop();
    }
  }

  private stopPlayback(): void {
    this.playGeneration++;
    this.loadGeneration++;
    this.pause('ambient', false);
    this.pause('sfx', false);
    this.ambientState.update((s) => ({ ...s, playing: false, progress: 0 }));
    this.sfxState.update((s) => ({ ...s, playing: false, progress: 0 }));
    this.redraw('ambient');
    this.redraw('sfx');
  }

  private startProgressLoop(): void {
    this.stopProgressLoop();
    const tick = () => {
      if (this.activeTrack) {
        this.updateProgress(this.activeTrack);
        this.redraw(this.activeTrack);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopProgressLoop(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateProgress(id: 'ambient' | 'sfx'): void {
    const state = id === 'ambient' ? this.ambientState() : this.sfxState();
    const audio = this.audioEl(id);
    if (!audio || !state.waveform?.durationSec) return;
    const progress = audio.currentTime / state.waveform.durationSec;
    const sig = id === 'ambient' ? this.ambientState : this.sfxState;
    sig.update((s) => ({ ...s, progress: Math.min(1, progress) }));
    if (audio.ended) {
      sig.update((s) => ({ ...s, playing: false, progress: 0 }));
      this.activeTrack = null;
      this.stopProgressLoop();
    }
  }

  private redraw(id: 'ambient' | 'sfx'): void {
    const canvas =
      id === 'ambient'
        ? this.ambientCanvas?.nativeElement
        : this.sfxCanvas?.nativeElement;
    const state = id === 'ambient' ? this.ambientState() : this.sfxState();
    if (!canvas || !state.waveform) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(200, Math.floor(rect.width * dpr));
    canvas.height = Math.floor(56 * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const peaks = state.waveform.peaks;
    const progress = state.progress;
    const playedBars = Math.floor(progress * peaks.length);

    ctx.clearRect(0, 0, w, h);

    const bars = peaks.length;
    const gap = Math.max(1, Math.floor(2 * dpr));
    const barW = (w - gap * (bars - 1)) / bars;
    const centerY = h / 2;

    for (let i = 0; i < bars; i++) {
      const peak = peaks[i];
      const barH = Math.max(2 * dpr, peak * h * 0.82);
      const x = i * (barW + gap);
      const played = i <= playedBars;
      ctx.fillStyle = played
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(255, 255, 255, 0.38)';
      ctx.fillRect(x, centerY - barH / 2, barW, barH);
    }

    const playX = progress * w;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(playX, 0);
    ctx.lineTo(playX, h);
    ctx.stroke();
  }

  private audioEl(id: 'ambient' | 'sfx'): HTMLAudioElement | undefined {
    return id === 'ambient'
      ? this.ambientAudio?.nativeElement
      : this.sfxAudio?.nativeElement;
  }

  private emptyTrack(): TrackUi {
    return {
      loading: false,
      error: null,
      waveform: null,
      playing: false,
      progress: 0,
      showUrl: false,
    };
  }
}
