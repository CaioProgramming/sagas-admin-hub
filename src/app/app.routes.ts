import { Routes } from '@angular/router';
import { Welcome } from './pages/welcome/welcome';
import { LandingPage } from './pages/landing-page/landing-page';
import { soulKeyGuard } from './services/soul-key.guard';
import { adminInitGuard } from './services/admin-init.guard';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'welcome', component: Welcome },
  {
    path: 'admin',
    canActivate: [soulKeyGuard, adminInitGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'namespace-explorer',
        loadComponent: () =>
          import('./pages/namespace-explorer/namespace-explorer').then(
            m => m.NamespaceExplorer
          ),
      },
      {
        path: 'blueprint-lab',
        loadComponent: () =>
          import('./pages/blueprint-lab/blueprint-lab').then(m => m.BlueprintLab),
      },
      {
        path: 'silhouette-studio',
        loadComponent: () =>
          import('./pages/silhouette-studio/silhouette-studio').then(
            m => m.SilhouetteStudio
          ),
      },
      {
        path: 'sprite-cutter',
        loadComponent: () =>
          import('./pages/sprite-cutter/sprite-cutter').then(m => m.SpriteCutter),
      },
      {
        path: 'staging',
        loadComponent: () =>
          import('./pages/staging/staging').then(m => m.Staging),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
