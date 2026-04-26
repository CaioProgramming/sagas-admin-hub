import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NamespaceService, RemoteConfigFeature } from '../../services/namespace.service';

@Component({
  selector: 'app-namespace-explorer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="explorer-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Namespace Explorer ⬢</h1>
          <p>Group and audit Remote Config flags by feature prefix</p>
        </div>
        <button class="btn btn-primary" (click)="refresh()" [disabled]="namespaceService.loading()">
          {{ namespaceService.loading() ? 'Fetching...' : 'Sync Template' }}
        </button>
      </header>

      <!-- Dashboard Summary -->
      <div class="dashboard-stats" *ngIf="namespaceService.features().length > 0">
        <div class="stat-card glass-card">
          <span class="label">Total Features</span>
          <span class="value">{{ namespaceService.features().length }}</span>
        </div>
        <div class="stat-card glass-card">
          <span class="label">Healthy Flags</span>
          <span class="value healthy">{{ totalHealthy() }}</span>
        </div>
        <div class="stat-card glass-card warning" [class.active]="totalWarnings() > 0">
          <span class="label">Audit Warnings</span>
          <span class="value">{{ totalWarnings() }}</span>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="features-grid" *ngIf="!namespaceService.loading(); else loadingTemplate">
        <div class="feature-card glass-card" *ngFor="let feature of namespaceService.features()">
          <div class="feature-header">
            <span class="feature-icon">📁</span>
            <div class="feature-title-wrap">
              <h3>{{ feature.name }}</h3>
              <span class="flag-count">{{ feature.flags.length }} flags</span>
            </div>
            <div class="feature-badges">
              <span class="badge warning" *ngIf="feature.warningCount > 0">{{ feature.warningCount }}</span>
              <span class="badge success" *ngIf="feature.warningCount === 0">✓</span>
            </div>
          </div>
          
          <div class="flag-list">
            <div class="flag-row" *ngFor="let flag of feature.flags | slice:0:3">
              <span class="flag-key">{{ flag.key }}</span>
              <div class="flag-tags">
                <span class="tag-warn" *ngIf="flag.warnings.length > 0">⚠️</span>
              </div>
            </div>
            <div class="more-flags" *ngIf="feature.flags.length > 3">
              + {{ feature.flags.length - 3 }} more
            </div>
          </div>

          <div class="feature-footer">
            <button class="btn btn-secondary btn-sm" (click)="inspectFeature(feature)">Inspect Namespace</button>
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Analyzing Remote Config namespaces...</p>
        </div>
      </ng-template>

      <!-- Feature Details Sidebar (Overlay) -->
       <div class="overlay" *ngIf="selectedFeature()" (click)="selectedFeature.set(null)">
         <div class="details-panel glass-card" (click)="$event.stopPropagation()">
            <div class="panel-header">
              <h2>Namespace: {{ selectedFeature()?.name }}</h2>
              <button class="close-btn" (click)="selectedFeature.set(null)">×</button>
            </div>
            
            <div class="panel-content">
              <div class="flag-detail-item" *ngFor="let flag of selectedFeature()?.flags">
                <div class="flag-main">
                  <span class="key">{{ flag.key }}</span>
                  <span class="value">{{ flag.value }}</span>
                </div>
                <div class="flag-audit" *ngIf="flag.warnings.length > 0">
                  <div class="warning-msg" *ngFor="let warn of flag.warnings">
                    ⚠️ {{ warn }}
                  </div>
                </div>
              </div>
            </div>
         </div>
       </div>
    </div>
  `,
  styles: [`
    .explorer-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .stat-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat-card .label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-card .value {
      font-size: 2.5rem;
      font-weight: 800;
      font-family: var(--font-display);
    }

    .stat-card .value.healthy { color: #4ade80; }
    .stat-card.warning.active .value { color: #fbbf24; }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .feature-card:hover {
      transform: translateY(-5px);
      border-color: var(--sagas-red);
    }

    .feature-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .feature-icon { font-size: 1.5rem; }

    .feature-title-wrap { flex-grow: 1; }

    .feature-title-wrap h3 {
      font-size: 1.1rem;
      margin: 0;
      color: var(--primary-color);
    }

    .flag-count {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .badge.warning { background: #fbbf2422; color: #fbbf24; }
    .badge.success { background: #4ade8022; color: #4ade80; }

    .flag-list {
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .flag-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
    }

    .flag-key {
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .more-flags {
      font-size: 0.7rem;
      color: var(--sagas-red);
      font-style: italic;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem;
      gap: 1.5rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(139, 38, 53, 0.1);
      border-top-color: var(--sagas-red);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(10px);
      z-index: 2000;
      display: flex;
      justify-content: flex-end;
    }

    .details-panel {
      width: 500px;
      height: 100%;
      border-left: 1px solid var(--sagas-red);
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--outline-ghost);
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
    }

    .panel-content {
      flex-grow: 1;
      overflow-y: auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .flag-detail-item {
      background: var(--surface-low);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--outline-ghost);
    }

    .flag-main {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .flag-main .key { color: var(--primary-color); font-weight: bold; font-family: monospace; }
    .flag-main .value { color: var(--text-secondary); font-size: 0.85rem; word-break: break-all; }

    .flag-audit {
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(251, 191, 36, 0.2);
    }

    .warning-msg {
      color: #fbbf24;
      font-size: 0.75rem;
    }

    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; }
  `]
})
export class NamespaceExplorer implements OnInit {
  protected namespaceService = inject(NamespaceService);
  protected selectedFeature = signal<RemoteConfigFeature | null>(null);

  ngOnInit() {
    if (this.namespaceService.features().length === 0) {
      this.refresh();
    }
  }

  refresh() {
    this.namespaceService.refreshTemplate();
  }

  totalHealthy() {
    return this.namespaceService.features().reduce((acc, f) => acc + f.healthyCount, 0);
  }

  totalWarnings() {
    return this.namespaceService.features().reduce((acc, f) => acc + f.warningCount, 0);
  }

  inspectFeature(feature: RemoteConfigFeature) {
    this.selectedFeature.set(feature);
  }
}
