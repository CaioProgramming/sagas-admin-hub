import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { SilhouetteStudio } from './pages/silhouette-studio/silhouette-studio';
import { SpriteCutter } from './pages/sprite-cutter/sprite-cutter';
import { NamespaceExplorer } from './pages/namespace-explorer/namespace-explorer';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'namespace-explorer', component: NamespaceExplorer },
  { path: 'silhouette-studio', component: SilhouetteStudio },
  { path: 'sprite-cutter', component: SpriteCutter }
];
