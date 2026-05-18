import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Sidebar],
  template: `
    <div class="admin-shell" [class.full-width]="isLandingPage()">
      <app-sidebar *ngIf="!isLandingPage()"></app-sidebar>
      <main class="content-area">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .admin-shell.full-width {
      display: block;
      height: auto;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .content-area {
      flex-grow: 1;
      padding: 0;
      overflow-y: auto;
      background: var(--bg-color);
    }
  `]
})
export class App {
  router = inject(Router);

  isLandingPage(): boolean {
    const url = this.router.url;
    // Hide sidebar on root, landing, and welcome pages
    return url === '/' || url === '/landing' || url.includes('/welcome') || !url.includes('/admin');
  }
}


