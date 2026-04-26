import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlueprintService, GenreSoul } from '../../services/blueprint.service';
import { NamespaceService } from '../../services/namespace.service';
import { MANDATORY_GENRE_KEYS } from '../../models/genre-config';

@Component({
  selector: 'app-blueprint-lab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lab-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Blueprint & Genre Soul Lab 🧪</h1>
          <p>Validate AI personas and rendering instructions across dimensions</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="refreshAll()">Sync & Validate</button>
        </div>
      </header>

      <!-- Genre Soul Grid -->
      <section class="souls-section">
        <div class="section-title">
          <h2>Active Genre Souls</h2>
          <span class="badge">{{ blueprintService.genres().length }} Definitive Genres</span>
        </div>

        <div class="souls-grid">
          <div class="soul-card glass-card" 
               *ngFor="let soul of blueprintService.genres()"
               [class.missing]="!soul.isFound"
               (click)="soul.isFound && selectSoul(soul)">
            
            <div class="soul-banner">
              <img [src]="soul.config.imageUrl || 'https://placehold.co/400x200/161622/666?text=No+Image'" 
                   [alt]="soul.name"
                   onerror="this.src='https://placehold.co/400x200/161622/666?text=Invalid+Image'">
              <div class="health-overlay">
                <div class="health-bar" [style.width.%]="soul.health" [class.low]="soul.health < 80"></div>
                <span class="health-text">{{ soul.health }}% SOUL HEALTH</span>
              </div>
            </div>

            <div class="soul-info">
              <h3>{{ soul.name }}</h3>
              <div class="status-tags">
                <span class="tag" *ngIf="soul.isFound">Canonical</span>
                <span class="tag warn" *ngIf="!soul.isFound">Disconnected</span>
                <span class="tag error" *ngIf="soul.missingKeys.length > 0">{{ soul.missingKeys.length }} Missing Fields</span>
              </div>
            </div>

            <div class="soul-actions" *ngIf="soul.isFound">
              <button class="btn btn-primary btn-sm">Inspect Soul</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Soul Preview Modal -->
      <div class="overlay" *ngIf="selectedSoul()" (click)="selectedSoul.set(null)">
        <div class="soul-preview-modal glass-card" (click)="$event.stopPropagation()">
          <div class="modal-layout">
            
            <!-- Left: Visual Preview -->
            <div class="visual-preview">
              <img [src]="selectedSoul()?.config?.imageUrl" class="preview-img">
              <div class="instructions-overlay">
                <div class="overlay-header">Rendering Instructions Context</div>
                <p>{{ selectedSoul()?.config?.renderingInstructions }}</p>
                <div class="overlay-footer">Simulated AI Prompt Injection</div>
              </div>
              <button class="close-btn" (click)="selectedSoul.set(null)">×</button>
            </div>

            <!-- Right: Validation Details -->
            <div class="soul-details">
              <div class="details-header">
                <h2>{{ selectedSoul()?.name }} Soul Architecture</h2>
                <div class="health-chip" [class.low]="selectedSoul()!.health < 80">
                  {{ selectedSoul()?.health }}% Integrity
                </div>
              </div>

              <div class="validation-list">
                <div class="validation-item" *ngFor="let key of mandatoryKeys">
                  <div class="key-info">
                    <span class="status-icon" [class.valid]="selectedSoul()?.config?.[key]">
                      {{ selectedSoul()?.config?.[key] ? '✓' : '✗' }}
                    </span>
                    <span class="key-name">{{ key }}</span>
                  </div>
                  <div class="key-value" *ngIf="selectedSoul()?.config?.[key]; else missingValue">
                    {{ selectedSoul()?.config?.[key] }}
                  </div>
                  <ng-template #missingValue>
                    <div class="key-value missing">Field missing in Remote Config</div>
                  </ng-template>
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
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .soul-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--outline-ghost);
    }

    .soul-card:hover {
      transform: translateY(-8px);
      border-color: var(--sagas-red);
      box-shadow: 0 15px 30px rgba(0,0,0,0.4);
    }

    .soul-card.missing {
      opacity: 0.5;
      filter: grayscale(1);
      cursor: not-allowed;
    }

    .soul-banner {
      height: 160px;
      position: relative;
      background: #000;
    }

    .soul-banner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.8;
    }

    .health-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%);
    }

    .health-bar {
      height: 3px;
      background: var(--success);
      margin-bottom: 0.5rem;
      border-radius: 2px;
      box-shadow: 0 0 10px var(--success);
    }

    .health-bar.low {
      background: #fbbf24;
      box-shadow: 0 0 10px #fbbf24;
    }

    .health-text {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: white;
    }

    .soul-info {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .soul-info h3 {
      font-size: 1.25rem;
      font-family: var(--font-display);
      margin: 0;
    }

    .status-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 2px 6px;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      color: var(--text-secondary);
    }

    .tag.warn { color: #fbbf24; }
    .tag.error { color: #ef4444; }

    .soul-actions {
      padding: 0 1.5rem 1.5rem;
      margin-top: auto;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(15px);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .soul-preview-modal {
      width: 100%;
      max-width: 1200px;
      height: 85vh;
      overflow: hidden;
      border: 1px solid var(--sagas-red);
    }

    .modal-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      height: 100%;
    }

    .visual-preview {
      position: relative;
      background: #000;
      overflow: hidden;
    }

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.7;
    }

    .instructions-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 3rem;
      background: linear-gradient(0deg, rgba(0,0,0,0.95) 40%, transparent 100%);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .overlay-header {
      font-size: 11px;
      font-weight: 700;
      color: var(--sagas-red);
      text-transform: uppercase;
      letter-spacing: 0.2em;
    }

    .instructions-overlay p {
      font-family: 'Fira Code', monospace;
      font-size: 0.95rem;
      line-height: 1.8;
      color: #fff;
    }

    .overlay-footer {
      font-size: 10px;
      color: var(--text-muted);
      font-style: italic;
    }

    .soul-details {
      padding: 3rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      overflow-y: auto;
      background: var(--surface-lowest);
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    }

    .key-value.missing {
      color: #ef4444;
      font-style: italic;
      border: 1px dashed rgba(239, 68, 68, 0.3);
    }

    .close-btn {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 40px;
      height: 40px;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .close-btn:hover { background: var(--sagas-red); }
  `]
})
export class BlueprintLab implements OnInit {
  protected blueprintService = inject(BlueprintService);
  protected namespaceService = inject(NamespaceService);
  
  protected selectedSoul = signal<GenreSoul | null>(null);
  protected readonly mandatoryKeys = MANDATORY_GENRE_KEYS;

  ngOnInit() {
    this.refreshAll();
  }

  async refreshAll() {
    await this.namespaceService.refreshTemplate();
    this.blueprintService.syncBlueprints();
  }

  selectSoul(soul: GenreSoul) {
    this.selectedSoul.set(soul);
  }
}
