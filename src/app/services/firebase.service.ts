import { Injectable } from '@angular/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private remoteConfig: RemoteConfig;

  constructor() {
    this.app = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.remoteConfig = getRemoteConfig(this.app);
    this.remoteConfig.settings.minimumFetchIntervalMillis = 60000;
  }

  get config(): RemoteConfig {
    return this.remoteConfig;
  }
}
