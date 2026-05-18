import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteConfigService } from '../../services/remote-config.service';
import { NamespaceService } from '../../services/namespace.service';
import { GeminiService } from '../../services/gemini.service';
import { StagingService } from '../../services/staging.service';
import { GenreConfig } from '../../models/genre-config';
import { GenreVisualConfig } from '../../models/genre-visual-config';
import { GenreFontPreviewComponent } from '../../components/genre-font-preview/genre-font-preview.component';
import { GenreAudioPreviewComponent } from '../../components/genre-audio-preview/genre-audio-preview.component';
import { GenrePromptStudioComponent } from '../../components/genre-prompt-studio/genre-prompt-studio.component';
import { GenreBundle, GenreConfigService } from '../../services/genre-config.service';
import { GenreFieldCheck, GenreHealthService } from '../../services/genre-health.service';
import { GenreFieldSource } from '../../models/genre-field-spec';
import { GENRE_FIELD_USAGE } from '../../models/genre-field-usage';

interface GenreSoul {
  id: string;
  name: string;
  bundle: GenreBundle;
  coverImage: string;
  health: number;
  soulHealth: number;
  visualHealth: number;
  sfxHealth: number;
  isFound: boolean;
  missingCount: number;
  checks: GenreFieldCheck[];
}

@Component({
  selector: 'app-blueprint-lab',
  standalone: true,
  imports: [
    CommonModule,
    GenreFontPreviewComponent,
    GenreAudioPreviewComponent,
    GenrePromptStudioComponent,
  ],
  template: `
    <div class="lab-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Blueprint & Genre Soul Lab 🧪</h1>
          <p>Validate AI personas and rendering instructions across dimensions</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="refreshAll(true)">Sync & Validate</button>
        </div>
      </header>

      <details class="field-map-panel">
        <summary>Android field map (used vs legacy)</summary>
        <div class="field-map-grid">
          <div
            class="field-map-row"
            *ngFor="let row of fieldUsageMap"
            [class.unused]="row.androidUsage === 'unused'"
          >
            <span class="fm-config">{{ row.config }}</span>
            <code class="fm-key">{{ row.key }}</code>
            <span class="usage-badge" [attr.data-usage]="row.androidUsage">{{ row.androidUsage }}</span>
            <span class="fm-note">{{ row.summary }}</span>
          </div>
        </div>
      </details>

      <!-- Genre Soul Grid -->
      <section class="souls-section">
        <div class="section-title">
          <h2>Active Genre Souls</h2>
          <span class="badge">{{ souls().length }} Definitive Genres</span>
        </div>

        <div class="souls-grid">
          <article
            class="soul-card"
            *ngFor="let soul of souls()"
            [class.missing]="!soul.isFound"
            [class.selected]="selectedSoul()?.id === soul.id"
            [style.--theme-accent]="themeAccent(soul)"
            (click)="onSoulCardClick(soul)"
          >
            <img
              class="soul-cover"
              [src]="soul.coverImage || 'https://placehold.co/400x600/161622/666?text=No+Image'"
              [alt]="soul.name"
              loading="lazy"
              onerror="this.src='https://placehold.co/400x600/161622/666?text=Invalid+Image'"
            />
            <div class="soul-scrim"></div>
            <div class="soul-glass-ring" aria-hidden="true"></div>

            <div class="health-top">
              <div class="health-track">
                <div
                  class="health-bar"
                  [style.width.%]="soul.health"
                  [class.low]="soul.health < 80"
                ></div>
              </div>
            </div>

            <div class="card-overlay">
              <h3 class="soul-title">{{ soul.name }}</h3>

              <div class="status-tags">
                <span class="tag frosted" *ngIf="soul.isFound">Canonical</span>
                <span class="tag frosted warn" *ngIf="!soul.isFound">Disconnected</span>
                <span class="tag frosted error" *ngIf="soul.missingCount > 0">
                  {{ soul.missingCount }} missing
                </span>
                <span class="tag frosted" *ngIf="hasFonts(soul.bundle.visual)">Fonts</span>
                <span class="tag frosted" *ngIf="hasAudio(soul.bundle)">Audio</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Soul Preview Modal -->
      <div class="overlay" *ngIf="selectedSoul()" (click)="selectedSoul.set(null)">
        <div class="soul-preview-modal glass-card" (click)="$event.stopPropagation()">
          <div class="modal-layout">
            
            <app-genre-prompt-studio
              *ngIf="selectedSoul()"
              [bundle]="selectedSoul()!.bundle"
              [coverImage]="selectedSoul()!.coverImage"
              [accentColor]="themeAccent(selectedSoul()!)"
              (closeModal)="selectedSoul.set(null)"
            />

            <!-- Right: Validation Details -->
            <div class="soul-details">
              <div class="details-header">
                <div class="title-wrap">
                  <h2>{{ selectedSoul()?.name }} Soul Architecture</h2>
                  <div class="health-chip" [class.low]="selectedSoul()!.health < 80">
                    {{ selectedSoul()?.health }}% Integrity
                  </div>
                  <p class="health-breakdown" *ngIf="selectedSoul()">
                    Soul {{ selectedSoul()!.soulHealth }}% · Visual {{ selectedSoul()!.visualHealth }}% · SFX {{ selectedSoul()!.sfxHealth }}%
                  </p>
                </div>
                <button class="btn btn-secondary btn-sm ai-btn" 
                        (click)="runAiAudit()" 
                        [disabled]="aiLoading()">
                  {{ aiLoading() ? 'Analyzing...' : '🪄 AI Audit Soul' }}
                </button>
              </div>

              <!-- AI Results -->
              <div class="ai-results glass-card" *ngIf="aiResult()">
                <div class="ai-header">
                  <span class="icon">✨</span>
                  <span>Gemini Auditor Suggestions</span>
                  <button class="btn btn-primary btn-xs apply-ai" 
                          *ngIf="suggestedChanges"
                          (click)="applyAiSuggestions()">
                    Apply Suggested Soul
                  </button>
                </div>
                <div class="ai-content">{{ aiResult() }}</div>
              </div>

              <app-genre-audio-preview
                *ngIf="selectedSoul()"
                [genreId]="selectedSoul()!.id"
                [genreRcName]="selectedSoul()!.bundle.rcName"
                [ambientMusicUrl]="selectedSoul()!.bundle.soul?.ambientMusicUrl ?? ''"
                [replySfxUrl]="selectedSoul()!.bundle.replySfxUrl"
                [vibrationPattern]="selectedSoul()!.bundle.visual?.vibrationPattern ?? null"
                [themeColors]="themeColors(selectedSoul()!)"
              />

              <app-genre-font-preview
                *ngIf="selectedSoul()"
                [genreId]="selectedSoul()!.id"
                [headerFontUrl]="selectedSoul()!.bundle.visual?.headerFontUrl ?? ''"
                [bodyFontUrl]="selectedSoul()!.bundle.visual?.bodyFontUrl ?? ''"
                (fontUrlsChange)="onFontUrlsChange($event)"
              />

              <div class="validation-list" *ngIf="selectedSoul()">
                <div class="validation-group" *ngFor="let group of validationGroups()">
                  <h4 class="group-title">
                    {{ group.title }}
                    <span class="group-key">{{ group.stagingKey }}</span>
                  </h4>
                  <div class="validation-item" *ngFor="let check of group.checks">
                    <div class="key-info">
                      <span class="status-icon" [class.valid]="check.present">
                        {{ check.present ? '✓' : '✗' }}
                      </span>
                      <span class="key-name">{{ check.spec.label }}</span>
                      <span
                        class="usage-badge"
                        *ngIf="check.spec.androidUsage"
                        [attr.data-usage]="check.spec.androidUsage"
                      >{{ check.spec.androidUsage }}</span>
                      <span class="req-tag" *ngIf="check.spec.required">required</span>
                    </div>
                    <div class="key-value" *ngIf="check.present; else missingValue">
                      <textarea
                        class="edit-area"
                        [value]="check.displayValue"
                        (blur)="updateField(check, $any($event.target).value)"
                      ></textarea>
                    </div>
                    <ng-template #missingValue>
                      <div class="key-value missing">Missing in Remote Config</div>
                    </ng-template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lab-container {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .section-title h2 {
      font-size: 1.4rem;
      color: var(--text-primary);
    }

    .souls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.25rem;
    }

    .soul-card {
      --theme-accent: #8b2635;
      position: relative;
      aspect-ratio: 3 / 4;
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      isolation: isolate;
      transition:
        transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 0.28s ease;
      box-shadow:
        0 8px 28px rgba(0, 0, 0, 0.35),
        0 0 0 1px color-mix(in srgb, var(--theme-accent) 35%, transparent);
    }

    .soul-card:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow:
        0 18px 40px rgba(0, 0, 0, 0.45),
        0 0 0 1px color-mix(in srgb, var(--theme-accent) 65%, transparent),
        0 0 32px color-mix(in srgb, var(--theme-accent) 22%, transparent);
    }

    .soul-card.selected {
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--theme-accent) 85%, white 10%),
        0 0 40px color-mix(in srgb, var(--theme-accent) 30%, transparent);
    }

    .soul-card.missing {
      opacity: 0.55;
      filter: grayscale(0.85);
      cursor: not-allowed;
    }

    .soul-cover {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    .soul-scrim {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.05) 0%,
        rgba(0, 0, 0, 0.15) 45%,
        rgba(0, 0, 0, 0.72) 100%
      );
      pointer-events: none;
    }

    .soul-glass-ring {
      position: absolute;
      inset: 0;
      z-index: 2;
      border-radius: inherit;
      pointer-events: none;
      border: 1px solid color-mix(in srgb, var(--theme-accent) 50%, rgba(255, 255, 255, 0.2));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        inset 0 -24px 48px color-mix(in srgb, var(--theme-accent) 12%, transparent);
    }

    .card-overlay {
      position: absolute;
      inset: 0;
      z-index: 3;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0.85rem;
      gap: 0.45rem;
    }

    .frosted {
      background: rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(14px) saturate(1.25);
      -webkit-backdrop-filter: blur(14px) saturate(1.25);
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .health-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 4;
      padding: 0.55rem 0.65rem 0;
    }

    .health-track {
      height: 3px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }

    .health-bar {
      height: 100%;
      border-radius: inherit;
      background: color-mix(in srgb, var(--theme-accent) 80%, #4ade80);
      box-shadow: 0 0 8px color-mix(in srgb, var(--theme-accent) 55%, transparent);
      transition: width 0.5s ease;
    }

    .health-bar.low {
      background: #fbbf24;
      box-shadow: 0 0 8px rgba(251, 191, 36, 0.55);
    }

    .soul-title {
      margin: 0;
      font-size: 1.1rem;
      font-family: var(--font-display);
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #fff;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
    }

    .status-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .tag {
      font-size: 8px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.06em;
      padding: 0.22rem 0.5rem;
      border-radius: 999px;
      color: rgba(255, 255, 255, 0.88);
    }

    .tag.warn {
      color: #fde68a;
      border-color: rgba(251, 191, 36, 0.35);
    }

    .tag.error {
      color: #fecaca;
      border-color: rgba(239, 68, 68, 0.4);
    }

    .tag.sub {
      font-size: 8px;
      opacity: 0.75;
      letter-spacing: 0.02em;
      text-transform: none;
    }

    .health-breakdown {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin: 0.35rem 0 0;
    }

    .validation-group {
      margin-bottom: 1.5rem;
    }

    .group-title {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      margin: 0 0 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: baseline;
    }

    .group-key {
      font-family: 'Fira Code', monospace;
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: none;
    }

    .req-tag {
      font-size: 8px;
      text-transform: uppercase;
      color: #fbbf24;
      margin-left: auto;
    }

    .usage-badge {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 1px 5px;
      border-radius: 4px;
    }

    .usage-badge[data-usage='active'] {
      color: #86efac;
      background: rgba(34, 197, 94, 0.12);
    }

    .usage-badge[data-usage='partial'] {
      color: #fde68a;
      background: rgba(251, 191, 36, 0.12);
    }

    .usage-badge[data-usage='unused'] {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.12);
    }

    .field-map-panel {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
    }

    .field-map-panel summary {
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.5);
    }

    .field-map-grid {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      max-height: 220px;
      overflow-y: auto;
    }

    .field-map-row {
      display: grid;
      grid-template-columns: 52px 140px 64px 1fr;
      gap: 0.5rem;
      align-items: baseline;
      font-size: 0.68rem;
      padding: 0.25rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .field-map-row.unused {
      opacity: 0.65;
    }

    .fm-config {
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.35);
      font-weight: 700;
    }

    .fm-key {
      font-family: 'Fira Code', monospace;
      color: rgba(255, 255, 255, 0.7);
    }

    .fm-note {
      color: rgba(255, 255, 255, 0.45);
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 4, 8, 0.72);
      backdrop-filter: blur(24px) saturate(1.1);
      -webkit-backdrop-filter: blur(24px) saturate(1.1);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .soul-preview-modal {
      width: 100%;
      max-width: 1280px;
      height: 90vh;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(10, 10, 14, 0.55);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
    }

    .modal-layout {
      display: grid;
      grid-template-columns: minmax(320px, 1fr) minmax(380px, 1.05fr);
      height: 100%;
      min-height: 0;
    }

    .modal-layout app-genre-prompt-studio {
      display: flex;
      min-height: 0;
      height: 100%;
    }

    .soul-details {
      padding: 1.25rem 1.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.15);
      border-left: 1px solid rgba(255, 255, 255, 0.06);
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .title-wrap h2 {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 0.35rem;
      letter-spacing: -0.02em;
    }

    .ai-btn {
      border-color: var(--purple);
      color: #a78bfa;
      background: rgba(139, 92, 246, 0.1);
    }

    .ai-results {
      padding: 1.5rem;
      background: rgba(139, 92, 246, 0.05);
      border: 1px solid rgba(139, 92, 246, 0.2);
      margin-bottom: 2rem;
      border-radius: 12px;
    }

    .ai-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 800;
      color: #a78bfa;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .ai-content {
      font-size: 0.85rem;
      line-height: 1.6;
      color: var(--text-secondary);
      white-space: pre-wrap;
      word-break: break-all;
    }

    .apply-ai {
      margin-left: auto;
      background: var(--primary-gradient);
      font-size: 10px;
    }

    .edit-area {
      width: 100%;
      min-height: 80px;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 6px;
      color: white;
      padding: 0.75rem;
      font-family: inherit;
      font-size: 0.85rem;
      resize: vertical;
      transition: all 0.3s;
    }

    .edit-area:focus {
      outline: none;
      border-color: var(--sagas-red);
      background: rgba(0,0,0,0.5);
    }

    .health-chip {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 800;
      font-size: 0.8rem;
    }

    .health-chip.low {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
    }

    .validation-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .validation-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .key-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 12px;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .status-icon.valid {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .key-name {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .key-value {
      font-size: 0.85rem;
      background: rgba(0,0,0,0.2);
      padding: 1rem;
      border-radius: 8px;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-all;
      word-wrap: break-word;
    }

    .key-value.missing {
      color: #ef4444;
      font-style: italic;
      border: 1px dashed rgba(239, 68, 68, 0.3);
    }

  `]
})
export class BlueprintLab implements OnInit {
  readonly fieldUsageMap = GENRE_FIELD_USAGE;
  protected genreConfigService = inject(GenreConfigService);
  protected remoteConfigService = inject(RemoteConfigService);
  protected namespaceService = inject(NamespaceService);
  protected geminiService = inject(GeminiService);
  protected stagingService = inject(StagingService);
  protected genreHealthService = inject(GenreHealthService);

  protected selectedSoul = signal<GenreSoul | null>(null);

  protected aiLoading = signal(false);
  protected aiResult = signal<string | null>(null);
  protected suggestedChanges: any = null;

  souls = computed(() => {
    const genresDict = this.genreConfigService.genres();
    return Object.values(genresDict).map(bundle => {
      const report = this.genreHealthService.evaluate(
        bundle.id,
        bundle.rcName,
        bundle.soul,
        bundle.visual,
        bundle.replySfxUrl
      );

      return {
        id: bundle.id,
        name: bundle.rcName,
        bundle,
        coverImage: this.genreConfigService.resolveImageUrl(bundle),
        health: report.health,
        soulHealth: report.soulHealth,
        visualHealth: report.visualHealth,
        sfxHealth: report.sfxHealth,
        isFound: !!(bundle.soul || bundle.visual),
        missingCount: report.missingRequired.length,
        checks: report.checks,
      } as GenreSoul;
    });
  });

  validationGroups = computed(() => {
    const soul = this.selectedSoul();
    if (!soul) return [];
    return this.buildValidationGroups(soul.checks);
  });

  ngOnInit() {
    void this.refreshAll();
  }

  async refreshAll(forceNamespace = false) {
    const tasks: Promise<unknown>[] = [
      this.remoteConfigService.ensureActivated(true),
      this.genreConfigService.syncGenreConfigs(),
    ];

    if (forceNamespace || this.namespaceService.features().length === 0) {
      tasks.push(this.namespaceService.refreshTemplate(forceNamespace));
    }

    await Promise.all(tasks);
  }

  hasFonts(visual: GenreBundle['visual']): boolean {
    const header = visual?.headerFontUrl?.trim();
    const body = visual?.bodyFontUrl?.trim();
    return !!(header || body);
  }

  themeAccent(soul: GenreSoul): string {
    const primary = soul.bundle.visual?.primaryColor?.trim();
    if (primary) return primary;
    const fromPalette = soul.bundle.visual?.colorPalette?.find((c) => c?.trim());
    if (fromPalette) return fromPalette.trim();
    return soul.bundle.soul?.primaryColor?.trim() || '#5c5c6e';
  }

  onSoulCardClick(soul: GenreSoul): void {
    if (!soul.isFound) return;
    this.selectSoul(soul);
  }

  themeColors(soul: GenreSoul): string[] {
    const palette = soul.bundle.visual?.colorPalette ?? [];
    const primary = soul.bundle.visual?.primaryColor;
    const colors = [...palette];
    if (primary && !colors.includes(primary)) {
      colors.unshift(primary);
    }
    return colors.length ? colors : [primary || '#8b2635', '#e91e63'];
  }

  hasAudio(bundle: GenreBundle): boolean {
    return !!(
      bundle.soul?.ambientMusicUrl?.trim() ||
      bundle.replySfxUrl?.trim() ||
      (bundle.visual?.vibrationPattern?.length ?? 0) > 0
    );
  }

  onFontUrlsChange(patch: { headerFontUrl?: string; bodyFontUrl?: string }) {
    const soul = this.selectedSoul();
    if (!soul) return;
    const visual = {
      ...(soul.bundle.visual ?? ({} as GenreVisualConfig)),
      ...patch,
    } as GenreVisualConfig;
    const bundle: GenreBundle = { ...soul.bundle, visual };
    this.patchSelectedSoul(bundle);
  }

  private buildValidationGroups(checks: GenreFieldCheck[]) {
    const order: { source: GenreFieldSource; title: string; stagingKey: string }[] = [
      { source: 'soul', title: 'Soul Config', stagingKey: '{genre}_config' },
      { source: 'visual', title: 'Visual Config', stagingKey: '{genre}_visual_config' },
      { source: 'sfx', title: 'Reply SFX', stagingKey: 'reply_sfx_config' },
    ];

    const soul = this.selectedSoul();
    const genreId = soul?.id ?? '';

    return order.map(group => ({
      title: group.title,
      stagingKey: group.stagingKey.replace('{genre}', genreId),
      checks: checks.filter(
        c =>
          c.spec.source === group.source &&
          c.spec.key !== 'headerFontUrl' &&
          c.spec.key !== 'bodyFontUrl'
      ),
    }));
  }

  private patchSelectedSoul(bundle: GenreBundle) {
    const report = this.genreHealthService.evaluate(
      bundle.id,
      bundle.rcName,
      bundle.soul,
      bundle.visual,
      bundle.replySfxUrl
    );
    const current = this.selectedSoul();
    if (!current) return;
    this.selectedSoul.set({
      ...current,
      bundle,
      coverImage: this.genreConfigService.resolveImageUrl(bundle),
      health: report.health,
      soulHealth: report.soulHealth,
      visualHealth: report.visualHealth,
      sfxHealth: report.sfxHealth,
      missingCount: report.missingRequired.length,
      checks: report.checks,
    });
  }

  selectSoul(soul: GenreSoul) {
    this.aiResult.set(null);
    this.suggestedChanges = null;
    this.selectedSoul.set(soul);
  }

  async runAiAudit() {
    const soul = this.selectedSoul();
    if (!soul) return;

    this.aiLoading.set(true);
    this.aiResult.set(null);
    this.suggestedChanges = null;
    
    try {
      const merged = { ...(soul.bundle.soul ?? {}), ...(soul.bundle.visual ?? {}) };
      const result = await this.geminiService.auditGenre(soul.name, merged);
      this.aiResult.set(result);
      
      // Try to parse suggested changes
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          this.suggestedChanges = parsed.SUGGESTED_CHANGES;
        } catch (e) {
          console.warn('Failed to parse suggested changes JSON');
        }
      }
    } finally {
      this.aiLoading.set(false);
    }
  }

  applyAiSuggestions() {
    if (!this.suggestedChanges || !this.selectedSoul()) return;
    
    const soul = this.selectedSoul()!;
    const genreKey = `${soul.id}_config`;
    
    const existing =
      this.stagingService.getDraftJson<Record<string, unknown>>(genreKey) ??
      ({ ...(soul.bundle.soul ?? {}) } as Record<string, unknown>);
    const updatedConfig = { ...existing, ...this.suggestedChanges };
    this.stagingService.updateDraft(genreKey, JSON.stringify(updatedConfig));
    
    alert('AI Suggestions applied to your Staging Draft! Check the Sync page to push.');
  }

  updateField(check: GenreFieldCheck, value: string) {
    const soul = this.selectedSoul();
    if (!soul) return;

    if (check.spec.source === 'sfx') {
      const map =
        this.stagingService.getDraftJson<Record<string, string>>('reply_sfx_config') ??
        {};
      this.stagingService.updateDraft(
        'reply_sfx_config',
        JSON.stringify({ ...map, [soul.bundle.rcName]: value.trim() })
      );
      this.patchSelectedSoul({
        ...soul.bundle,
        replySfxUrl: value.trim(),
      });
      return;
    }

    const key = check.stagingKey;
    const base =
      check.spec.source === 'soul'
        ? ({ ...(soul.bundle.soul ?? {}) } as Record<string, unknown>)
        : ({ ...(soul.bundle.visual ?? {}) } as Record<string, unknown>);
    const existing = this.stagingService.getDraftJson<Record<string, unknown>>(key) ?? base;

    let parsed: unknown = value;
    if (check.spec.valueType === 'json') {
      try {
        parsed = JSON.parse(value);
      } catch {
        return;
      }
    } else if (check.spec.valueType === 'number') {
      parsed = Number(value);
    }

    const updated = { ...existing, [check.spec.key]: parsed };
    this.stagingService.updateDraft(key, JSON.stringify(updated));

    const bundle: GenreBundle =
      check.spec.source === 'soul'
        ? { ...soul.bundle, soul: updated as GenreConfig }
        : { ...soul.bundle, visual: updated as unknown as GenreVisualConfig };
    this.patchSelectedSoul(bundle);
  }
}
