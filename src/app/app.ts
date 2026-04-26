import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';
import { StagingService } from './services/staging.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Sidebar],
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
      padding: 0;
      overflow-y: auto;
      background: var(--bg-color);
    }
  `]
})
export class App implements OnInit {
  staging = inject(StagingService);

  ngOnInit() {
    this.staging.init();
  }
}
