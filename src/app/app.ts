import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  template: `
    <div class="admin-shell">
      <app-sidebar></app-sidebar>
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

    .content-area {
      flex-grow: 1;
      padding: 2rem;
      overflow-y: auto;
      background: radial-gradient(circle at 10% 10%, #1a0a0c 0%, var(--bg-color) 40%);
    }
  `]
})
export class App {}
