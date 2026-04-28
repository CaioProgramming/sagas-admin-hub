import { Component, inject, Output, EventEmitter, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenreConfigService } from '../../../../services/genre-config.service';
import { TranslationService } from '../../../../services/translation.service';
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
          <div class="carousel-track" [class.is-revealed]="isRevealed">
            <div *ngFor="let genre of displayGenres(); let i = index" 
                 class="universe-card"
                 [style]="getCardStyle(genre, i)"
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
                <p class="genre-description">{{ genre.description }}</p>
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
      width: max-content;
      will-change: transform;
    }
    .carousel-track.is-revealed {
      animation: scroll 80s linear infinite;
      animation-delay: 2s;
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
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      cursor: pointer;
      opacity: 0;
    }
    
    .carousel-track.is-revealed .universe-card {
      animation: slide-up-card 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: var(--deal-delay, 0s);
    }
    
    @keyframes slide-up-card {
      0% { opacity: 0; transform: translateY(150px) scale(0.9); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .universe-card:hover {  
      transform: scale(1.02) translateY(-10px); 
      border-color: var(--card-color);
      box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 30px var(--card-color);
    }

    .card-image-bg { 
      position: absolute; 
      inset: 0; 
      background-size: cover; 
      background-position: center; 
      opacity: 0.5; 
      filter: var(--image-filters);
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); 
      z-index: 1;
    }
    .universe-card:hover .card-image-bg { opacity: 0.85; transform: scale(1.05); filter: var(--image-filters-hover); }
    
    .shader-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
      z-index: 2;
    }

    .grain-overlay {
      position: absolute; inset: 0; pointer-events: none; opacity: calc(var(--grain-opacity) * 0.5);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      z-index: 3;
    }

    .card-content { position: relative; z-index: 10; padding: 3rem; }
    .genre-label { 
      font-size: 2rem; font-weight: 900; text-transform: uppercase; 
      color: #FFF; line-height: 1; display: block;
    }
    
    .soul-health { height: 2px; width: 60px; background: rgba(255,255,255,0.1); margin-top: 1.5rem; border-radius: 1px; overflow: hidden; }
    .health-bar { height: 100%; background: var(--card-color); transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1); }

    .genre-description {
      margin-top: 1.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9);
      opacity: 0;
      transform: translateY(15px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .universe-card:hover .genre-description {
      opacity: 1;
      transform: translateY(0);
      transition-delay: 0.05s;
    }
  `]
})
export class GenreCarouselComponent {
  @Input() isRevealed = false;
  genreConfigService = inject(GenreConfigService);
  ts = inject(TranslationService);
  @Output() genreHover = new EventEmitter<string>();

  displayGenres = computed(() => {
    const genresDict = this.genreConfigService.genres();
    const genreList = Object.entries(genresDict).map(([id, config]) => {
      const translationKeyDesc = `genre_desc_${id.toLowerCase()}`;
      const translatedDesc = this.ts.t(translationKeyDesc);
      
      const translationKeyTitle = `genre_title_${id.toLowerCase()}`;
      const translatedTitle = this.ts.t(translationKeyTitle);
      
      // Fallback to default desc if specific translation is missing (i.e. returns the key itself)
      const finalDesc = translatedDesc === translationKeyDesc ? this.ts.t('genre_desc_default') : translatedDesc;
      const finalTitle = translatedTitle === translationKeyTitle ? id.toUpperCase() : translatedTitle;
      
      return {
        ...config,
        name: finalTitle,
        description: finalDesc,
        health: (config as any).health || 100
      };
    });
    
    if (genreList.length === 0) return [];
    // Triple the array for the infinite track illusion, efficiently cached by 'computed'
    return [...genreList, ...genreList, ...genreList];
  });

  getCardStyle(genre: GenreConfig, index: number) {
    const p = genre.shaderParams;
    const brightness = 1 + (p?.brightness ?? 0);
    const contrast = p?.contrast ?? 1;
    const saturation = p?.saturation ?? 1;
    const blur = p?.softFocusRadius ?? 0;
    const color = genre.primaryColor || '#E91E63';

    const filterString = blur > 0 
      ? `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`
      : `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
      
    const filterHoverString = blur > 0 
      ? `brightness(${brightness * 1.1}) contrast(${contrast * 1.05}) saturate(${saturation * 1.3}) blur(${blur}px)`
      : `brightness(${brightness * 1.1}) contrast(${contrast * 1.05}) saturate(${saturation * 1.3})`;

    return {
      '--card-color': color,
      '--corner-radius': (genre.cornerSizeDp || 24) + 'px',
      '--grain-opacity': (p?.grainIntensity ?? 0.1),
      '--image-filters': filterString,
      '--image-filters-hover': filterHoverString,
      '--deal-delay': `${index * 0.08}s`
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
