import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SoulKeyService } from './soul-key.service';

export const soulKeyGuard: CanActivateFn = async () => {
  const soulKey = inject(SoulKeyService);
  const router = inject(Router);

  const isAuthorized = await soulKey.validateHandshake();
  
  if (isAuthorized) {
    return true;
  } else {
    router.navigate(['/welcome']);
    return false;
  }
};
