import { Injectable, inject, signal } from '@angular/core';
import { RemoteConfigService } from './remote-config.service';
import { OnboardingAsset } from '../models/onboarding-asset';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private remoteConfigService = inject(RemoteConfigService);

  avatarFaces = signal<OnboardingAsset[]>([]);
  isLoading = signal(false);

  async syncAvatars() {
    this.isLoading.set(true);
    try {
      const assets = this.remoteConfigService.getJson<OnboardingAsset[]>('avatar_faces');
      console.log('AvatarService: Fetched assets', assets);
      if (assets) {
        this.avatarFaces.set(assets);
      } else {
        console.warn('AvatarService: No assets found for key "avatar_faces"');
      }
    } catch (error) {
      console.error('AvatarService: Sync Failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
