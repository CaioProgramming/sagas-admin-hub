import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenreConfigService } from '../../../../services/genre-config.service';
import { GenreConfig } from '../../../../models/genre-config';

@Component({
  selector: 'app-genre-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carousel-section-wrapper">
      <!-- Loading State: Cosmic Portal -->
      <div class="cosmic-loader" *ngIf="genreConfigService.isLoading()">
        <div class="portal-ring"></div>
        <div class="portal-ring"></div>
        <div class="portal-core"></div>
        <span class="portal-text">SYNCING REALITIES...</span>
      </div>

      <!-- Real Data State -->
      <div class="carousel-content-reveal" *ngIf="!genreConfigService.isLoading()">
        <div class="infinite-carousel-container">
          <div class="carousel-track">
            <div *ngFor="let genre of displayGenres" 
                 class="universe-card"
                 [style]="getCardStyle(genre)"
                 (mouseenter)="onGenreHover(genre)">
              
              <div class="card-image-bg" 
                   [style.background-image]="'url(' + resolveUrl(genre.imageUrl) + ')'">
              </div>
              
              <div class="shader-overlay"></div>
              <div class="grain-overlay"></div>
              
              <div class="card-content">
                <span class="genre-label">{{ genre.name || 'UNIVERSE' }}</span>
                <div class="soul-health">
                  <div class="health-bar" [style.width.%]="genre.health || 100"></div>
                </div>
              </div>
              
              <div class="card-overlay">
                <span class="view-more">EXPLORE →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carousel-section-wrapper {
      width: 100%;
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Cosmic Portal */
    .cosmic-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3rem;
      position: relative;
    }

    .portal-ring {
      position: absolute;
      width: 160px;
      height: 160px;
      border: 1px solid var(--nebula-color, #E91E63);
      border-radius: 50%;
      animation: spin 4s infinite linear;
      opacity: 0.4;
    }
    .portal-ring:nth-child(2) {
      width: 190px;
      height: 190px;
      border-style: dashed;
      animation-direction: reverse;
      animation-duration: 6s;
    }
    .portal-core {
      width: 30px;
      height: 30px;
      background: #FFF;
      border-radius: 50%;
      box-shadow: 0 0 50px #FFF, 0 0 100px var(--nebula-color, #E91E63);
      animation: pulse 2s ease-in-out infinite;
    }

    .portal-text {
      font-weight: 900;
      letter-spacing: 0.6em;
      font-size: 0.8rem;
      color: #FFF;
      opacity: 0.7;
      margin-top: 6rem;
    }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.3); opacity: 1; } }

    /* Infinite Carousel */
    .infinite-carousel-container {
      width: 100vw;
      padding: 6rem 0;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
    }

    .carousel-track {
      display: flex;
      gap: 3rem;
      animation: scroll 80s linear infinite;
      width: max-content;
    }
    .carousel-track:hover { animation-play-state: paused; }

    @keyframes scroll { 
      from { transform: translateX(0); } 
      to { transform: translateX(calc(-50% - 1.5rem)); } 
    }

    .universe-card {
      width: clamp(280px, 25vw, 400px);
      height: clamp(400px, 35vw, 540px);
      background: #080808;
      border: 1px solid rgba(255,255,255,0.08);
      position: relative;
      border-radius: var(--corner-radius);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      cursor: crosshair;
    }

    .universe-card:hover { 
      transform: scale(1.03) translateY(-15px); 
      border-color: var(--card-color);
      box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 30px rgba(var(--card-color-rgb), 0.2);
    }

    .card-image-bg { 
      position: absolute; 
      inset: 0; 
      background-size: cover; 
      background-position: center; 
      opacity: 0.5; 
      filter: var(--image-filters);
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
      z-index: 1;
    }
    .universe-card:hover .card-image-bg { opacity: 0.9; transform: scale(1.1); filter: var(--image-filters-hover); }
    
    .shader-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
      z-index: 2;
    }

    .grain-overlay {
      position: absolute; inset: 0; pointer-events: none; opacity: var(--grain-opacity);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      mix-blend-mode: overlay; z-index: 3;
    }

    .card-content { position: relative; z-index: 10; padding: 3rem; }
    .genre-label { 
      font-size: 2rem; font-weight: 900; text-transform: uppercase; 
      color: #FFF; line-height: 1; display: block;
    }
    
    .soul-health { height: 2px; width: 60px; background: rgba(255,255,255,0.1); margin-top: 1.5rem; border-radius: 1px; overflow: hidden; }
    .health-bar { height: 100%; background: var(--card-color); transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1); }

    .card-overlay { 
      position: absolute; 
      inset: 0; 
      background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%); 
      z-index: 5; 
    }

    .view-more { 
      position: absolute; bottom: 4rem; right: 4rem; font-weight: 900; 
      opacity: 0; transform: translateX(-20px); transition: all 0.4s ease; z-index: 10;
      font-size: 0.9rem; letter-spacing: 0.2em; color: #FFF;
    }
    .universe-card:hover .view-more { opacity: 0.6; transform: translateX(0); }
  `]
})
export class GenreCarouselComponent {
  genreConfigService = inject(GenreConfigService);
  @Output() genreHover = new EventEmitter<string>();

  get displayGenres(): (GenreConfig & { name: string })[] {
    const genresDict = this.genreConfigService.genres();
    const genreList = Object.entries(genresDict).map(([id, config]) => ({
      ...config,
      name: id.toUpperCase()
    }));
    
    if (genreList.length === 0) return [];
    return [...genreList, ...genreList, ...genreList];
  }

  getCardStyle(genre: GenreConfig) {
    const p = genre.shaderParams;
    const brightness = 1 + (p?.brightness ?? 0);
    const contrast = p?.contrast ?? 1;
    const saturation = p?.saturation ?? 1;
    const blur = p?.softFocusRadius ?? 0;
    const color = genre.primaryColor || '#E91E63';

    return {
      '--card-color': color,
      '--corner-radius': (genre.cornerSizeDp || 24) + 'px',
      '--grain-opacity': (p?.grainIntensity ?? 0.1),
      '--image-filters': `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`,
      '--image-filters-hover': `brightness(${brightness * 1.1}) contrast(${contrast * 1.05}) saturate(${saturation * 1.3})`
    };
  }

  onGenreHover(genre: GenreConfig) {
    this.genreHover.emit(genre.primaryColor || '#FF1744');
  }

  resolveUrl(url: string | undefined): string {
    if (!url) return '/logo.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  }
}
