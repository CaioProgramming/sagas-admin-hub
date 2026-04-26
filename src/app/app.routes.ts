import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { SilhouetteStudio } from './pages/silhouette-studio/silhouette-studio';
import { SpriteCutter } from './pages/sprite-cutter/sprite-cutter';
import { NamespaceExplorer } from './pages/namespace-explorer/namespace-explorer';
import { BlueprintLab } from './pages/blueprint-lab/blueprint-lab';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'namespace-explorer', component: NamespaceExplorer },
  { path: 'blueprint-lab', component: BlueprintLab },
  { path: 'silhouette-studio', component: SilhouetteStudio },
  { path: 'sprite-cutter', component: SpriteCutter }
];
