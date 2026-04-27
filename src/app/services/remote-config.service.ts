import { Injectable } from '@angular/core';
import { getRemoteConfig, getValue, fetchAndActivate, RemoteConfig } from 'firebase/remote-config';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {
  private remoteConfig: RemoteConfig;

  constructor() {
    this.remoteConfig = getRemoteConfig(getApp());
    // For development, set fetch interval to 0
    this.remoteConfig.settings.minimumFetchIntervalMillis = 0;
  }

  async fetchAndActivate(): Promise<boolean> {
    try {
      return await fetchAndActivate(this.remoteConfig);
    } catch (error) {
      console.error('RemoteConfig: Fetch failed', error);
      return false;
    }
  }

  getString(key: string): string {
    return getValue(this.remoteConfig, key).asString();
  }

  getBoolean(key: string): boolean {
    return getValue(this.remoteConfig, key).asBoolean();
  }

  getNumber(key: string): number {
    return getValue(this.remoteConfig, key).asNumber();
  }

  getJson<T>(key: string): T | null {
    const jsonString = this.getString(key);
    if (!jsonString || jsonString === '') return null;
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`RemoteConfig: Error parsing JSON for key "${key}"`, error);
      return null;
    }
  }
}
