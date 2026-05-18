import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenreBundle } from '../../services/genre-config.service';
import {
  GenreImageLabService,
  ImagenPromptStreamEvent,
} from '../../services/genre-image-lab.service';
import { ImageTestType } from '../../services/gemini.service';
import { parseAIGenerationString } from '../../utils/ai-json.util';

@Component({
  selector: 'app-genre-prompt-studio',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'prompt-studio-host' },
  template: `
    <section class="studio" [style.--theme-accent]="accentColor">
      <div class="hero">
        <img
          [src]="coverImage || 'https://placehold.co/600x900/161622/666?text=Theme'"
          class="hero-img"
          alt="Theme reference"
        />
        <div class="hero-vignette"></div>

        <header class="hero-top">
          <nav class="toolbar">
            <button
              type="button"
              class="chip"
              [class.active]="showContext()"
              (click)="showContext.set(!showContext())"
            >
              Soul context
            </button>
            <button
              type="button"
              class="chip"
              [class.active]="activeType() === 'ICON'"
              [disabled]="testLoading()"
              (click)="runTest('ICON')"
            >
              Portrait
            </button>
            <button
              type="button"
              class="chip"
              [class.active]="activeType() === 'COVER'"
              [disabled]="testLoading()"
              (click)="runTest('COVER')"
            >
              Cover
            </button>
            @if (fullPrompt()) {
              <button type="button" class="chip" (click)="clearPrompt()">Clear</button>
            }
          </nav>

          @if (testLoading()) {
            <span class="status-pill">
              <span class="pulse-ring"></span>
              {{ testStatus() }}
            </span>
          }

          <button type="button" class="close-fab" (click)="closeModal.emit()">×</button>
        </header>

        @if (showBottomDock()) {
          <footer class="hero-bottom">
            @if (showContext()) {
              <div class="context-inline text-reveal" [style.animation-delay.ms]="0">
                <p class="context-label">Rendering instructions</p>
                <p>{{ bundle.soul?.renderingInstructions || '—' }}</p>
                @if (lastBrief()) {
                  <p class="brief"><strong>Scene:</strong> {{ lastBrief() }}</p>
                }
              </div>
            }

            @if (testError()) {
              <p class="error-inline text-reveal">{{ testError() }}</p>
            }

            @if (overlayText()) {
              <div
                class="prompt-dock text-reveal"
                [attr.data-rev]="contentRevision()"
                [title]="fullPrompt() ?? ''"
              >
                <div class="dock-header">
                  <span class="dock-label">Final image prompt</span>
                  @if (fullPrompt()) {
                    <button type="button" class="copy-btn" (click)="copyPrompt()">
                      {{ copied() ? 'Copied' : 'Copy' }}
                    </button>
                  }
                </div>
                <p
                  class="dock-body"
                  [class.is-streaming]="testLoading() && !fullPrompt()"
                >{{ overlayPreview() }}</p>
                @if (lastMeta()) {
                  <p class="dock-meta">
                    {{ lastMeta()!.type === 'ICON' ? 'Portrait' : 'Cover' }}
                    · {{ lastMeta()!.aspectRatio }}
                    · {{ lastMeta()!.modelId }}
                  </p>
                }
              </div>
            }
          </footer>
        }
      </div>
    </section>
  `,
  styles: [`
    :host.prompt-studio-host {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
    }

    .studio {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      padding: 0.5rem;
    }

    .hero {
      position: relative;
      flex: 1;
      min-height: 0;
      border-radius: 16px;
      overflow: hidden;
      background: #0a0a10;
    }

    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .hero-vignette {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.5) 0%,
        transparent 28%,
        transparent 52%,
        rgba(0, 0, 0, 0.75) 100%
      );
    }

    .hero-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 5;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      padding: 0.65rem 0.7rem;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      flex: 1;
      min-width: 0;
    }

    .chip {
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      padding: 0.38rem 0.75rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      transition:
        background 0.22s ease,
        border-color 0.22s ease,
        transform 0.22s ease;
    }

    .chip:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 255, 255, 0.28);
      transform: translateY(-1px);
    }

    .chip.active {
      border-color: color-mix(in srgb, var(--theme-accent, #8b2635) 60%, transparent);
      background: color-mix(in srgb, var(--theme-accent, #8b2635) 28%, rgba(0, 0, 0, 0.4));
    }

    .chip:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.85);
      max-width: 42%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pulse-ring {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--theme-accent, var(--sagas-red));
      box-shadow: 0 0 8px var(--theme-accent, var(--sagas-red));
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.55; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    .close-fab {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #fff;
      font-size: 1.15rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s ease;
    }

    .close-fab:hover {
      background: rgba(0, 0, 0, 0.55);
    }

    .hero-bottom {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 4;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem;
      max-height: 48%;
      overflow-y: auto;
    }

    .text-reveal {
      animation: revealUp 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes revealUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .context-inline {
      font-size: 0.72rem;
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.78);
    }

    .context-label {
      margin: 0 0 0.25rem;
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.42);
    }

    .context-inline p {
      margin: 0;
    }

    .brief {
      margin-top: 0.35rem !important;
      opacity: 0.85;
    }

    .error-inline {
      margin: 0;
      font-size: 0.72rem;
      color: #fca5a5;
    }

    .prompt-dock {
      border-top: 1px solid color-mix(in srgb, var(--theme-accent) 40%, rgba(255, 255, 255, 0.12));
      padding-top: 0.55rem;
    }

    .dock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .dock-label {
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.42);
    }

    .copy-btn {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 0.35rem 0.8rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #ffffff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.38);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .dock-body {
      margin: 0;
      font-size: 0.74rem;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.92);
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      transition: opacity 0.28s ease;
    }

    .dock-body.is-streaming {
      opacity: 0.82;
      animation: textPulse 1.4s ease-in-out infinite;
    }

    @keyframes textPulse {
      0%, 100% { opacity: 0.72; }
      50% { opacity: 0.95; }
    }

    .dock-meta {
      margin: 0.4rem 0 0;
      font-size: 0.56rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.38);
    }
  `],
})
export class GenrePromptStudioComponent {
  @Input({ required: true }) bundle!: GenreBundle;
  @Input() coverImage = '';
  @Input() accentColor = '#8b2635';

  @Output() closeModal = new EventEmitter<void>();

  private imageLab = inject(GenreImageLabService);

  showContext = signal(false);
  testLoading = signal(false);
  testStatus = signal('');
  testError = signal<string | null>(null);
  fullPrompt = signal<string | null>(null);
  streamPreview = signal<string | null>(null);
  lastBrief = signal<string | null>(null);
  activeType = signal<ImageTestType | null>(null);
  lastMeta = signal<{
    type: ImageTestType;
    aspectRatio: string;
    modelId: string;
  } | null>(null);
  copied = signal(false);
  contentRevision = signal(0);

  overlayText = () =>
    !!(this.fullPrompt() || this.streamPreview() || (this.testLoading() && this.testStatus()));

  showBottomDock = () =>
    this.showContext() ||
    !!this.testError() ||
    !!this.fullPrompt() ||
    !!this.streamPreview() ||
    (this.testLoading() && !!this.overlayPreview());

  overlayPreview(): string {
    const final = this.fullPrompt();
    if (final) return final;
    const stream = this.streamPreview();
    if (!stream) return this.testLoading() ? this.testStatus() : '';
    const parsed = parseAIGenerationString(stream);
    if (parsed?.data?.trim()) return parsed.data.trim();
    return stream.slice(-800);
  }

  private bumpContentAnimation(): void {
    this.contentRevision.update((n) => n + 1);
  }

  async runTest(type: ImageTestType): Promise<void> {
    this.testLoading.set(true);
    this.testError.set(null);
    this.copied.set(false);
    this.fullPrompt.set(null);
    this.streamPreview.set(null);
    this.activeType.set(type);
    this.testStatus.set('Starting ImagenClient stream…');
    this.bumpContentAnimation();

    try {
      const result = await this.imageLab.runGenrePromptTest(
        this.bundle,
        type,
        (ev: ImagenPromptStreamEvent) => this.handleStream(ev)
      );
      this.fullPrompt.set(result.synthesizedPrompt);
      this.lastBrief.set(result.randomBrief);
      this.lastMeta.set({
        type: result.imageType,
        aspectRatio: result.aspectRatio,
        modelId: result.modelId,
      });
      this.bumpContentAnimation();
    } catch (e) {
      this.testError.set(e instanceof Error ? e.message : String(e));
      this.bumpContentAnimation();
    } finally {
      this.testLoading.set(false);
      this.testStatus.set('');
    }
  }

  private handleStream(ev: ImagenPromptStreamEvent): void {
    switch (ev.type) {
      case 'status':
        this.testStatus.set(ev.message);
        break;
      case 'reasoning':
        this.streamPreview.set(ev.chunk);
        this.bumpContentAnimation();
        break;
      case 'success':
        this.fullPrompt.set(ev.prompt);
        this.streamPreview.set(null);
        this.bumpContentAnimation();
        break;
      case 'error':
        this.testError.set(ev.message);
        this.bumpContentAnimation();
        break;
    }
  }

  clearPrompt(): void {
    this.fullPrompt.set(null);
    this.streamPreview.set(null);
    this.lastBrief.set(null);
    this.lastMeta.set(null);
    this.activeType.set(null);
    this.testError.set(null);
    this.copied.set(false);
    this.contentRevision.set(0);
  }

  async copyPrompt(): Promise<void> {
    const text = this.fullPrompt();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.testError.set('Could not copy to clipboard.');
    }
  }
}
