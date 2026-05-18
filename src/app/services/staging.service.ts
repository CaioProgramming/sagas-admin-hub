import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RemoteConfigAdminService } from './remote-config-admin.service';

@Injectable({
  providedIn: 'root'
})
export class StagingService {
  private adminService = inject(RemoteConfigAdminService);

  private productionTemplate = new BehaviorSubject<any>(null);
  private stagingTemplate = new BehaviorSubject<any>(null);
  private initPromise: Promise<void> | null = null;

  productionTemplate$ = this.productionTemplate.asObservable();
  stagingTemplate$ = this.stagingTemplate.asObservable();

  readonly modifiedKeysCount = signal(0);

  /**
   * Initializes staging once (Admin API template fetch).
   */
  async ensureInit(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    return this.initPromise;
  }

  async init() {
    try {
      const template = await this.adminService.getTemplate();
      this.productionTemplate.next(JSON.parse(JSON.stringify(template)));
      this.stagingTemplate.next(JSON.parse(JSON.stringify(template)));
      this.refreshModifiedCount();
    } catch (error) {
      console.error('Failed to init staging:', error);
      this.initPromise = null;
    }
  }

  getDraftJson<T>(key: string): T | null {
    const raw = this.stagingTemplate.value?.parameters?.[key]?.defaultValue?.value;
    if (!raw || typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  updateDraft(key: string, value: string, valueType: 'JSON' | 'STRING' = 'JSON') {
    const current = this.stagingTemplate.value;
    if (!current) return;

    const updated = { ...current };
    updated.parameters = { ...updated.parameters };

    updated.parameters[key] = {
      defaultValue: { value: value },
      valueType: valueType
    };

    this.stagingTemplate.next(updated);
    this.refreshModifiedCount();
  }

  getModifiedKeys(): string[] {
    const prod = this.productionTemplate.value?.parameters || {};
    const stage = this.stagingTemplate.value?.parameters || {};
    const keys = new Set([...Object.keys(prod), ...Object.keys(stage)]);

    return Array.from(keys).filter(key => {
      return JSON.stringify(prod[key]) !== JSON.stringify(stage[key]);
    });
  }

  discardChanges() {
    this.stagingTemplate.next(JSON.parse(JSON.stringify(this.productionTemplate.value)));
    this.refreshModifiedCount();
  }

  async pushToProduction() {
    const template = this.stagingTemplate.value;
    if (!template) return;

    await this.adminService.publishTemplate(template);
    this.productionTemplate.next(JSON.parse(JSON.stringify(template)));
    this.refreshModifiedCount();
  }

  private refreshModifiedCount() {
    this.modifiedKeysCount.set(this.getModifiedKeys().length);
  }
}
