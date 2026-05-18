import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FontPreviewService,
  GenreFontPreview,
  LoadedGenreFont,
} from '../../services/font-preview.service';
import { StagingService } from '../../services/staging.service';

@Component({
  selector: 'app-genre-font-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="font-preview-section glass">
      <div class="section-header">
        <span class="section-label">Typography</span>
        <span class="section-hint">Live proof — not in checklist</span>
      </div>

      <div class="font-role" *ngFor="let role of roles">
        <div class="role-header">
          <span class="role-name">{{ role.label }}</span>
          <span class="status-chip" [class]="statusClass(role.font)">
            {{ statusLabel(role.font) }}
          </span>
        </div>

        <input
          class="url-input"
          type="url"
          [value]="role.url"
          placeholder="https://…/font.ttf"
          (blur)="onUrlBlur(role.key, $any($event.target).value)"
        />

        <a
          *ngIf="role.url"
          class="url-link"
          [href]="role.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ truncateUrl(role.url) }}
        </a>

        <p *ngIf="role.font.error" class="error-msg">{{ role.font.error }}</p>

        <div
          class="sample"
          [class.sample-header]="role.key === 'header'"
          [class.sample-body]="role.key === 'body'"
          [style.font-family]="sampleFamily(role.font)"
        >
          {{ role.sampleText }}
        </div>
      </div>
    </section>
  `,
  styles: [`
    .glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
    }

    .font-preview-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .section-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: rgba(255, 255, 255, 0.45);
    }

    .section-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .font-role {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .role-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .role-name {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
    }

    .status-chip {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
    }

    .status-chip.loading {
      color: #fbbf24;
      background: rgba(251, 191, 36, 0.12);
    }

    .status-chip.loaded {
      color: #10b981;
      background: rgba(16, 185, 129, 0.12);
    }

    .status-chip.error {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.12);
    }

    .url-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.8rem;
      font-family: 'Fira Code', monospace;
    }

    .url-input:focus {
      outline: none;
      border-color: var(--sagas-red);
    }

    .url-link {
      font-size: 0.7rem;
      color: var(--text-muted);
      word-break: break-all;
    }

    .error-msg {
      font-size: 0.75rem;
      color: #ef4444;
      margin: 0;
    }

    .sample {
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 8px;
      color: #fff;
      border-left: 3px solid var(--sagas-red);
    }

    .sample-header {
      font-size: 1.75rem;
      font-weight: 800;
      line-height: 1.2;
    }

    .sample-body {
      font-size: 0.95rem;
      line-height: 1.65;
      font-weight: 400;
    }
  `],
})
export class GenreFontPreviewComponent implements OnChanges {
  @Input({ required: true }) genreId!: string;
  @Input() headerFontUrl = '';
  @Input() bodyFontUrl = '';
  @Output() fontUrlsChange = new EventEmitter<{
    headerFontUrl?: string;
    bodyFontUrl?: string;
  }>();

  private fontPreview = inject(FontPreviewService);
  private staging = inject(StagingService);

  preview = signal<GenreFontPreview>({
    header: { family: '', status: 'idle', url: '' },
    body: { family: '', status: 'idle', url: '' },
  });

  get roles() {
    const p = this.preview();
    return [
      {
        key: 'header' as const,
        label: 'Header',
        url: this.headerFontUrl?.trim() ?? '',
        font: p.header,
        sampleText: 'The Saga Begins',
      },
      {
        key: 'body' as const,
        label: 'Body',
        url: this.bodyFontUrl?.trim() ?? '',
        font: p.body,
        sampleText:
          'In a world where every choice shapes destiny, your legend unfolds one chapter at a time.',
      },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['genreId'] ||
      changes['headerFontUrl'] ||
      changes['bodyFontUrl']
    ) {
      void this.loadFonts();
    }
  }

  private async loadFonts(): Promise<void> {
    const result = await this.fontPreview.loadGenreFonts(
      this.genreId,
      this.headerFontUrl,
      this.bodyFontUrl
    );
    this.preview.set(result);
  }

  statusClass(font: LoadedGenreFont): string {
    return font.status === 'idle' ? '' : font.status;
  }

  statusLabel(font: LoadedGenreFont): string {
    switch (font.status) {
      case 'loading':
        return 'Loading';
      case 'loaded':
        return 'Loaded';
      case 'error':
        return 'Error';
      default:
        return font.url ? 'Pending' : 'Not set';
    }
  }

  sampleFamily(font: LoadedGenreFont): string {
    if (font.status === 'loaded' && font.family) {
      return `"${font.family}", var(--font-display)`;
    }
    return 'var(--font-body)';
  }

  truncateUrl(url: string, max = 48): string {
    if (url.length <= max) return url;
    return url.slice(0, max - 3) + '…';
  }

  onUrlBlur(role: 'header' | 'body', value: string): void {
    const trimmed = value.trim();
    const current =
      role === 'header'
        ? (this.headerFontUrl?.trim() ?? '')
        : (this.bodyFontUrl?.trim() ?? '');
    if (trimmed === current) return;

    const field = role === 'header' ? 'headerFontUrl' : 'bodyFontUrl';
    const key = `${this.genreId}_visual_config`;
    const existing = this.staging.getDraftJson<Record<string, unknown>>(key) ?? {};
    const updated = { ...existing, [field]: trimmed };
    this.staging.updateDraft(key, JSON.stringify(updated));
    this.fontUrlsChange.emit({ [field]: trimmed });
    void this.loadFonts();
  }
}
