import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RemoteConfigAdminService } from './remote-config-admin.service';

@Injectable({
  providedIn: 'root'
})
export class StagingService {
  private adminService = inject(RemoteConfigAdminService);

  private productionTemplate = new BehaviorSubject<any>(null);
  private stagingTemplate = new BehaviorSubject<any>(null);

  productionTemplate$ = this.productionTemplate.asObservable();
  stagingTemplate$ = this.stagingTemplate.asObservable();

  /**
   * Initializes the staging area by pulling the latest production config.
   */
  async init() {
    try {
      const template = await this.adminService.getTemplate();
      this.productionTemplate.next(JSON.parse(JSON.stringify(template)));
      this.stagingTemplate.next(JSON.parse(JSON.stringify(template)));
    } catch (error) {
      console.error('Failed to init staging:', error);
    }
  }

  /**
   * Updates a specific parameter in the staging draft.
   */
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
  }

  /**
   * Returns a list of keys that have been modified in staging.
   */
  getModifiedKeys(): string[] {
    const prod = this.productionTemplate.value?.parameters || {};
    const stage = this.stagingTemplate.value?.parameters || {};
    const keys = new Set([...Object.keys(prod), ...Object.keys(stage)]);
    
    return Array.from(keys).filter(key => {
      return JSON.stringify(prod[key]) !== JSON.stringify(stage[key]);
    });
  }

  /**
   * Discards all staging changes and resets to production.
   */
  discardChanges() {
    this.stagingTemplate.next(JSON.parse(JSON.stringify(this.productionTemplate.value)));
  }

  /**
   * Pushes the staging template to Production.
   */
  async pushToProduction() {
    const template = this.stagingTemplate.value;
    if (!template) return;

    await this.adminService.publishTemplate(template);
    
    // Refresh production view
    this.productionTemplate.next(JSON.parse(JSON.stringify(template)));
  }
}
