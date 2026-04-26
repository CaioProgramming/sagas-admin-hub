import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private remoteConfig: RemoteConfig;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.remoteConfig = getRemoteConfig(this.app);
    
    // Setting minimum fetch interval to 1 minute for the admin hub
    this.remoteConfig.settings.minimumFetchIntervalMillis = 60000;
  }

  get config(): RemoteConfig {
    return this.remoteConfig;
  }
}
