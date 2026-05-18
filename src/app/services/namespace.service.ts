import { Injectable, inject, signal } from '@angular/core';
import { getAll, Value } from 'firebase/remote-config';
import { FirebaseService } from './firebase.service';
import { RemoteConfigService } from './remote-config.service';

export interface RemoteConfigFlag {
  key: string;
  value: string;
  source: string;
  warnings: string[];
}

export interface RemoteConfigFeature {
  name: string;
  flags: RemoteConfigFlag[];
  healthyCount: number;
  warningCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NamespaceService {
  private firebaseService = inject(FirebaseService);
  private remoteConfigService = inject(RemoteConfigService);

  private featuresSignal = signal<RemoteConfigFeature[]>([]);
  public features = this.featuresSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  public loading = this.loadingSignal.asReadonly();

  async refreshTemplate(force = false) {
    this.loadingSignal.set(true);
    try {
      await this.remoteConfigService.ensureActivated(force);
      const allValues = getAll(this.firebaseService.config);
      this.parseFeatures(allValues);
    } catch (error) {
      console.error('Error fetching remote config:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private parseFeatures(values: Record<string, Value>) {
    const featureMap = new Map<string, RemoteConfigFlag[]>();

    Object.entries(values).forEach(([key, value]) => {
      const parts = key.split('_');
      const prefix = parts.length > 1 ? parts[0] : 'global';

      const flag: RemoteConfigFlag = {
        key: key,
        value: value.asString(),
        source: value.getSource(),
        warnings: this.auditFlag(key, value.asString())
      };

      if (!featureMap.has(prefix)) {
        featureMap.set(prefix, []);
      }
      featureMap.get(prefix)?.push(flag);
    });

    const features: RemoteConfigFeature[] = Array.from(featureMap.entries()).map(([name, flags]) => {
      const warningCount = flags.filter(f => f.warnings.length > 0).length;
      return {
        name,
        flags,
        healthyCount: flags.length - warningCount,
        warningCount
      };
    });

    features.sort((a, b) => {
      if (a.name === 'global') return -1;
      if (b.name === 'global') return 1;
      return a.name.localeCompare(b.name);
    });

    this.featuresSignal.set(features);
  }

  private auditFlag(key: string, value: string): string[] {
    const warnings: string[] = [];

    if (!value || value.trim() === '' || value === '{}' || value === '[]') {
      warnings.push('Empty value');
    }

    if (key.length > 50) {
      warnings.push('Key name too long (>50 chars)');
    }

    if (/[A-Z]/.test(key)) {
      warnings.push('Non-standard casing (Contains uppercase)');
    }

    if (key.includes(' ') || key.includes('-')) {
      warnings.push('Avoid spaces or hyphens (Use snake_case)');
    }

    return warnings;
  }
}
