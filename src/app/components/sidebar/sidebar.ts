import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StagingService } from '../../services/staging.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <img src="/logo.svg" alt="Sagas Spark" class="logo">
        <span class="brand-name">SAGAS HUB</span>
      </div>
      
      <nav class="nav-links">
        <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
          <span class="icon">⬢</span>
          Dashboard
        </a>
        <a routerLink="/admin/namespace-explorer" routerLinkActive="active" class="nav-item">
          <span class="icon">⌬</span>
          Namespace Explorer
        </a>
        <a routerLink="/admin/blueprint-lab" routerLinkActive="active" class="nav-item">
          <span class="icon">📜</span>
          Blueprints Lab
        </a>
        <a routerLink="/admin/silhouette-studio" routerLinkActive="active" class="nav-item">
          <span class="icon">⚡️</span>
          Silhouette Studio
        </a>
        <a routerLink="/admin/sprite-cutter" routerLinkActive="active" class="nav-item">
          <span class="icon">✂️</span>
          Sprite Cutter
        </a>
        
        <div class="nav-divider"></div>
        
        <a routerLink="/admin/staging" routerLinkActive="active" class="nav-item sync-nav">
          <span class="icon">🚀</span>
          Sync
          <span class="badge" *ngIf="staging.getModifiedKeys().length > 0">
            {{ staging.getModifiedKeys().length }}
          </span>
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">C</div>
          <div class="user-info">
            <span class="name">Admin</span>
            <span class="status">Online</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--surface-lowest);
      border-right: 1px solid var(--outline-ghost);
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 3rem;
    }

    .logo {
      width: 32px;
      height: 32px;
    }

    .brand-name {
      font-family: var(--font-display);
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--sagas-red);
      font-size: 1.2rem;
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-grow: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-default);
      transition: all 0.2s;
      cursor: pointer;
    }

    .nav-item:hover {
      background: var(--surface-low);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: rgba(139, 38, 53, 0.15);
      color: var(--primary-color);
      border-left: 3px solid var(--sagas-red);
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--outline-ghost);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: var(--sagas-red);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .nav-divider {
      height: 1px;
      background: var(--outline-ghost);
      margin: 1rem 0;
    }

    .sync-nav {
      position: relative;
    }

    .badge {
      margin-left: auto;
      background: var(--sagas-red);
      color: white;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 10px;
      font-weight: 800;
      box-shadow: 0 0 10px rgba(139, 38, 53, 0.4);
    }
  `]
})
export class Sidebar {
  staging = inject(StagingService);
}
