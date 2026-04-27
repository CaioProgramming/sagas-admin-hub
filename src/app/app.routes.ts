import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { SilhouetteStudio } from './pages/silhouette-studio/silhouette-studio';
import { SpriteCutter } from './pages/sprite-cutter/sprite-cutter';
import { NamespaceExplorer } from './pages/namespace-explorer/namespace-explorer';
import { BlueprintLab } from './pages/blueprint-lab/blueprint-lab';
import { Staging } from './pages/staging/staging';
import { Welcome } from './pages/welcome/welcome';
import { LandingPage } from './pages/landing-page/landing-page';
import { soulKeyGuard } from './services/soul-key.guard';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'welcome', component: Welcome },
  { 
    path: 'admin', 
    canActivate: [soulKeyGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'namespace-explorer', component: NamespaceExplorer },
      { path: 'blueprint-lab', component: BlueprintLab },
      { path: 'silhouette-studio', component: SilhouetteStudio },
      { path: 'sprite-cutter', component: SpriteCutter },
      { path: 'staging', component: Staging }
    ]
  },
  { path: '**', redirectTo: '' }
];


