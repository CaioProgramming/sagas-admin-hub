import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarService } from '../../../../services/avatar.service';
import { OnboardingAsset } from '../../../../models/onboarding-asset';

@Component({
  selector: 'app-avatar-morph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar-morph-container">
      <!-- Cosmic Constellation (Small Background Avatars) -->
      <div class="constellation-layer">
        <div class="drifting-avatar" *ngFor="let avatar of backgroundAvatars()"
             [style.left.%]="avatar.x"
             [style.top.%]="avatar.y"
             [style.animation-delay]="avatar.delay"
             [style.opacity]="0.25">
          <img [src]="resolveUrl(avatar.image)" 
               (error)="handleImageError($event)"
               alt="soul-fragment">
        </div>
      </div>

      <!-- Main Soul Morph (Central Large Avatar) -->
      <div class="main-avatar-wrapper" [class.is-morphing]="isMorphing()">
        <div class="avatar-glow"></div>
        <img [src]="resolveUrl(currentAvatarUrl())" 
             (error)="handleImageError($event)"
             alt="character-soul" class="central-avatar">
      </div>
    </div>
  `,
  styles: [`
    .avatar-morph-container {
      position: relative;
      width: 450px;
      height: 450px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .constellation-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .drifting-avatar {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      filter: grayscale(0.5) blur(1px);
      animation: levitate 5s infinite ease-in-out;
    }

    .drifting-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .main-avatar-wrapper {
      position: relative;
      width: 200px;
      height: 200px;
      z-index: 10;
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .central-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      box-shadow: 0 0 40px rgba(255,255,255,0.15);
      animation: levitate 4s infinite ease-in-out, zoom 6s infinite ease-in-out;
    }

    .avatar-glow {
      position: absolute;
      inset: -20px;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
      filter: blur(20px);
      z-index: -1;
    }

    /* Morph Animation State */
    .is-morphing {
      transform: scale(0.8);
      opacity: 0;
      filter: blur(15px) brightness(2);
    }

    @keyframes levitate {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }

    @keyframes zoom {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `]
})
export class AvatarMorphComponent implements OnInit, OnDestroy {
  avatarService = inject(AvatarService);
  
  currentAvatarUrl = signal('');
  isMorphing = signal(false);
  cycleInterval: any;

  // Pre-calculated background constellation positions
  backgroundAvatars = computed(() => {
    const assets = this.avatarService.avatarFaces();
    if (assets.length === 0) return [];
    
    // Pick 5 random ones for the background
    return Array.from({ length: 5 }).map((_, i) => ({
      ...assets[i % assets.length],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      delay: (Math.random() * 5) + 's'
    }));
  });

  resolveUrl(url: string): string {
    if (!url) return '/logo.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  }

  handleImageError(event: any) {
    const target = event.target;
    if (target.src.endsWith('/logo.svg')) {
      // If even logo fails, hide it to prevent loop
      target.style.display = 'none';
      return;
    }
    target.src = '/logo.svg';
  }

  ngOnInit() {
    this.startMorphCycle();
  }

  ngOnDestroy() {
    if (this.cycleInterval) clearInterval(this.cycleInterval);
  }

  startMorphCycle() {
    let index = 0;
    const assets = this.avatarService.avatarFaces;
    
    // Initial set
    if (assets().length > 0) {
      this.currentAvatarUrl.set(assets()[0].image);
    }

    this.cycleInterval = setInterval(() => {
      const currentAssets = assets();
      if (currentAssets.length === 0) return;

      this.isMorphing.set(true);
      
      setTimeout(() => {
        index = (index + 1) % currentAssets.length;
        this.currentAvatarUrl.set(currentAssets[index].image);
        this.isMorphing.set(false);
      }, 800); // 800ms for a smooth scale+blur out
    }, 4500);
  }
}
