import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { StagingService } from './staging.service';
import { RemoteConfigService } from './remote-config.service';

/** Loads admin-only resources (staging template + Remote Config) on first /admin visit. */
export const adminInitGuard: CanActivateFn = async () => {
  const staging = inject(StagingService);
  const remoteConfig = inject(RemoteConfigService);

  await Promise.all([staging.ensureInit(), remoteConfig.ensureActivated()]);
  return true;
};
