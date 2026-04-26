import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <header class="top-bar">
      <h1 class="page-title">Dashboard Overview</h1>
      <div class="actions">
        <button class="btn btn-primary">Deploy to Prod</button>
      </div>
    </header>

    <div class="dashboard-grid">
      <section class="summary-row">
        <div class="glass-card metric">
          <span class="label">Total Keys</span>
          <span class="value">124</span>
          <span class="trend">+2 this week</span>
        </div>
        <div class="glass-card metric">
          <span class="label">Active Blueprints</span>
          <span class="value">12</span>
          <span class="trend">All Validated</span>
        </div>
        <div class="glass-card metric">
          <span class="label">Asset Queue</span>
          <span class="value">5</span>
          <span class="trend">Pending Cut</span>
        </div>
      </section>

      <div class="main-grid">
        <section class="glass-card activity-feed">
          <h3>Recent Activities</h3>
          <div class="activity-list">
            <div class="activity-item">
              <span class="status-dot success"></span>
              <div class="activity-content">
                <p>Updated <strong>Cowboy Blueprint</strong></p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div class="activity-item">
              <span class="status-dot success"></span>
              <div class="activity-content">
                <p>New Sprite Cut: <strong>Dragon_Idle.png</strong></p>
                <small>4 hours ago</small>
              </div>
            </div>
            <div class="activity-item">
              <span class="status-dot warning"></span>
              <div class="activity-content">
                <p>Modified <strong>Genre Config: Fantasy</strong></p>
                <small>Yesterday</small>
              </div>
            </div>
          </div>
        </section>

        <section class="glass-card system-health">
          <h3>System Health</h3>
          <div class="health-metrics">
            <div class="health-item">
              <span>AI Latency</span>
              <span class="health-value">142ms</span>
            </div>
            <div class="health-item">
              <span>Firebase</span>
              <span class="health-value status-online">Connected</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
    }

    .page-title {
      font-size: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-default);
      border: none;
      font-family: var(--font-display);
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .btn-primary {
      background: var(--sagas-red);
      color: white;
    }

    .summary-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .metric .label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric .value {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 800;
    }

    .metric .trend {
      color: var(--tertiary);
      font-size: 0.85rem;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .activity-feed h3, .system-health h3 {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      color: var(--primary-color);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
    }

    .status-dot.success { background: var(--tertiary); box-shadow: 0 0 8px var(--tertiary); }
    .status-dot.warning { background: #FFB300; }

    .health-metrics {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .health-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .health-value {
      font-family: var(--font-display);
      font-weight: 700;
    }

    .status-online {
      color: var(--tertiary);
      text-shadow: 0 0 10px rgba(141, 213, 178, 0.4);
    }
  `]
})
export class Dashboard {}
