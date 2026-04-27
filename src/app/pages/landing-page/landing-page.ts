import { Component, ElementRef, OnInit, ViewChild, inject, OnDestroy, HostListener, signal, computed, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemoteConfigService } from '../../services/remote-config.service';
import { GenreConfigService } from '../../services/genre-config.service';
import { AvatarService } from '../../services/avatar.service';
import { TranslationService } from '../../services/translation.service';
import { GenreCarouselComponent } from './components/genre-carousel/genre-carousel.component';
import { AvatarMorphComponent } from './components/avatar-morph/avatar-morph.component';
import { SoulMirrorComponent } from './components/soul-mirror/soul-mirror.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, GenreCarouselComponent, AvatarMorphComponent, SoulMirrorComponent],
  template: `
    <div class="landing-container">
      <!-- High-Intensity Cosmic Engine (Cinematic Stars) -->
      <div class="cosmic-engine">
        <div class="stars-overlay">
          <div class="star-hero" *ngFor="let star of stars" 
               [style.left.%]="star.x" 
               [style.top.%]="star.y"
               [style.animation-delay]="star.delay"
               [style.transform]="'scale(' + star.size + ')'">
          </div>
        </div>
        
        <div class="nebula-cloud cloud-alpha" [style.--nebula-color]="currentNebulaColor()"></div>
        <div class="nebula-cloud cloud-beta" [style.--nebula-color]="secondaryNebulaColor"></div>
        <div class="nebula-cloud cloud-gamma" [style.--nebula-color]="currentNebulaColor()"></div>
        
        <div class="cosmic-grain"></div>
      </div>

      <!-- Safari-Style Floating Top Bar -->
      <nav class="top-nav" [class.is-visible]="isScrolled()">
        <div class="nav-brand">
          <svg class="nav-spark" viewBox="0 0 110 135" xmlns="http://www.w3.org/2000/svg">
            <path d="M54.17,110v-0.01,0.01c-2.02,-38.31 -5.69,-59.67 -38.07,-61.94 20.18,0 36.69,-15.7 37.98,-35.56l0.08,-2.29v-0.07,0.04l0.01,-0.04c0.07,20.97 17.08,37.92 38.06,37.92 -32.38,2.27 -36.06,23.63 -38.06,61.94z" fill="currentColor"/>
          </svg>
          <span class="brand-name">SAGAS</span>
        </div>
      </nav>

      <div class="main-content">
        <section class="hero-section" #heroSection>
          <div class="entrance-monolith">
            <div class="hero-spark-container">
                <div class="hero-spark-wrapper" [class.is-swapping]="isSwapping()">
                  <div class="genre-icon-mask" 
                       [style.--icon-url]="'url(' + heroCycle().path + ')'">
                  </div>
              </div>
              <div class="halo-spark s1"></div>
              <div class="halo-spark s2"></div>
            </div>
            
            <h1 class="display-lg">{{ ts.t('hero_title') }}</h1>
            <p class="marketing-sub">{{ ts.t('hero_subtitle') }}</p>
          </div>
        </section>

        <!-- Diversity Section -->
        <section class="experience-block carousel-block" #diversitySection>
          <div class="monolith-text">
            <h2 class="section-tag" [style.color]="currentNebulaColor()">{{ ts.t('diversity_tag') }}</h2>
            <h3 class="display-md">{{ ts.t('diversity_title') }}</h3>
            <p class="section-desc">{{ ts.t('diversity_desc') }}</p>
            
            <app-genre-carousel (genreHover)="setNebulaColor($event)"></app-genre-carousel>
          </div>
        </section>

        <section class="experience-block" #deepnessSection>
          <div class="split-layout">
            <div class="monolith-text">
              <h2 class="section-tag" [style.color]="currentNebulaColor()">{{ ts.t('deepness_tag') }}</h2>
              <h3 class="display-md">{{ ts.t('deepness_title') }}</h3>
              <div class="persona-tag">{{ ts.t('deepness_persona') }}</div>
              <p class="section-desc">{{ ts.t('deepness_desc') }}</p>
            </div>
            
            <div class="visual-monolith">
              <app-avatar-morph></app-avatar-morph>
            </div>
          </div>
        </section>

        <!-- Mirror Section (Emotional Aspect) -->
        <section class="experience-block" #mirrorSection>
          <div class="split-layout reverse">
            <div class="visual-monolith">
              <app-soul-mirror></app-soul-mirror>
            </div>
            <div class="monolith-text">
              <h2 class="section-tag" [style.color]="currentNebulaColor()">{{ ts.t('mirror_tag') }}</h2>
              <h3 class="display-md">{{ ts.t('mirror_title') }}</h3>
              <p class="section-desc">{{ ts.t('mirror_desc') }}</p>
            </div>
          </div>
        </section>

        <section class="cta-section" #ctaSection>
          <div class="monolith-cta">
            <h2 class="display-lg">{{ ts.t('hero_title') }}</h2>
            <button class="btn-download">{{ ts.t('hero_btn') }}</button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --nebula-color: #FF1744;
      --secondary-color: #2979FF;
      --font-display: 'Manrope', sans-serif;
      background: #000;
      color: #E2E2E2;
      display: block;
      font-family: var(--font-display);
      overflow-x: hidden;
    }

    .landing-container { position: relative; min-height: 100vh; }

    .cosmic-engine {
      position: fixed; inset: 0; z-index: 0;
      background: #000; overflow: hidden; pointer-events: none;
      transform: translateZ(0);
    }

    .main-content { position: relative; z-index: 10; }

    .stars-overlay { position: absolute; inset: 0; z-index: 5; }
    .star-hero {
      position: absolute; width: 8px; height: 8px; background: #FFF;
      clip-path: polygon(50% 0%, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0% 50%, 45% 45%);
      animation: twinkle 3s infinite ease-in-out;
      opacity: 0.6;
      filter: drop-shadow(0 0 2px #FFF);
    }

    @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.6); } 50% { opacity: 0.8; transform: scale(1.1); } }

    .top-nav { 
      position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%) translateY(-150%);
      width: 90vw; max-width: 1200px; padding: 0.8rem 2.5rem; z-index: 100; 
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(15, 15, 15, 0.4);
      backdrop-filter: blur(25px) saturate(1.8);
      -webkit-backdrop-filter: blur(25px) saturate(1.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 100px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
      opacity: 0;
      pointer-events: none;
    }
    .top-nav.is-visible { transform: translateX(-50%) translateY(0); opacity: 1; pointer-events: all; }

    .nav-brand { display: flex; align-items: center; gap: 1rem; }
    .nav-spark { width: 24px; color: #FFF; }
    .brand-name { font-weight: 900; font-size: 1rem; letter-spacing: 0.4em; }

    .lang-toggle { 
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); 
      color: #FFF; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.75rem; font-weight: 900; cursor: pointer;
      transition: all 0.3s;
    }
    .lang-toggle:hover { background: #FFF; color: #000; }

    .hero-spark-container { 
      margin-bottom: 4rem; height: 160px; position: relative;
      display: flex; align-items: center; justify-content: center; 
    }
    
    .hero-spark-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-spark-wrapper.is-swapping { transform: scale(0.8) rotate(-15deg); filter: blur(4px); opacity: 0; }

    .genre-icon-mask {
      width: 80px;
      height: 80px;
      background: #FFF;
      mask-image: var(--icon-url);
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;
      -webkit-mask-image: var(--icon-url);
      -webkit-mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
      box-shadow: 0 0 40px rgba(255,255,255,0.4);
      animation: pulse-icon 4s infinite ease-in-out;
    }

    @keyframes pulse-icon {
      0%, 100% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.1); filter: brightness(1.5) drop-shadow(0 0 20px #FFF); }
    }

    .halo-spark {
      position: absolute; width: 20px; height: 20px; background: #FFF;
      clip-path: polygon(50% 0%, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0% 50%, 45% 45%);
      animation: rotate-spark 6s infinite linear; opacity: 0.3;
    }
    .s1 { top: -15%; left: 55%; }
    .s2 { bottom: 10%; left: 15%; transform: scale(0.6); }

    @keyframes rotate-spark { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .nebula-cloud {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 160vw; height: 160vh; filter: blur(140px); -webkit-filter: blur(140px); opacity: 0.45;
      will-change: opacity, background-color;
      transition: background-color 4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1;
    }
    .cloud-alpha { background: radial-gradient(circle at 35% 35%, var(--nebula-color) 0%, transparent 65%); }
    .cloud-beta { background: radial-gradient(circle at 65% 65%, var(--secondary-color) 0%, transparent 65%); opacity: 0.3; }
    .cloud-gamma { background: radial-gradient(circle at 50% 50%, #4A00E0) opacity: 0.15; }

    .cosmic-grain {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E");
      mix-blend-mode: overlay; z-index: 15; opacity: 0.12;
    }

    .display-lg { font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 900; line-height: 0.9; margin: 0; text-transform: uppercase; color: #FFF; }
    .marketing-sub { font-size: clamp(1rem, 1.8vw, 1.4rem); margin-top: 2rem; color: #AAA; font-weight: 500; max-width: 700px; line-height: 1.5; }
    section { padding: 0 10vw; min-height: 100vh; display: flex; align-items: center; position: relative; }
    .section-tag { 
      font-size: 0.75rem; font-weight: 900; letter-spacing: 0.6em; 
      margin-bottom: 2rem; opacity: 0.6; text-transform: uppercase;
      transition: all 1s ease;
    }
    .display-md { font-size: clamp(2rem, 5vw, 4rem); font-weight: 900; line-height: 1.1; margin-bottom: 3rem; color: #FFF; }
    .section-desc { font-size: clamp(1rem, 1.8vw, 1.6rem); color: #BBB; line-height: 1.6; max-width: 800px; }

    .carousel-block { min-height: 130vh; padding: 15vh 10vw; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
    .carousel-block .monolith-text { width: 100%; margin-top: 5vh; }

    .centered-sub { margin-bottom: 8rem; opacity: 0.7; max-width: 750px; }
    .text-center { text-align: center; }

    .btn-download { 
      margin-top: 8rem; padding: 2.2rem 6rem; font-size: 2rem; font-weight: 900; 
      background: #FFF; color: #000; border: none; cursor: pointer; border-radius: 4px;
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-download:hover { transform: scale(1.05) translateY(-8px); box-shadow: 0 30px 80px rgba(255,255,255,0.3); }
    
    .persona-tag { font-weight: 900; letter-spacing: 0.4em; font-size: 0.85rem; margin-bottom: 1rem; color: #FFF; }

    .split-layout {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 5vw;
    }

    .split-layout.reverse {
      flex-direction: row-reverse;
    }

    .visual-monolith {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .cta-section { 
      min-height: 80vh; 
      background: radial-gradient(circle at 50% 100%, rgba(255,255,255,0.05) 0%, transparent 70%);
      padding-bottom: 15vh;
    }
    
    .monolith-cta { width: 100%; text-align: center; }
    
    .btn-download { 
      margin-top: 5rem; padding: 1.8rem 5rem; font-size: 1.4rem; font-weight: 900; 
      background: #FFF; color: #000; border: none; cursor: pointer; border-radius: 4px;
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .btn-download:hover { transform: scale(1.05) translateY(-8px); box-shadow: 0 30px 80px rgba(255,255,255,0.3); }
  `]
})
export class LandingPage implements OnInit, OnDestroy {
  remoteConfigService = inject(RemoteConfigService);
  genreConfigService = inject(GenreConfigService);
  avatarService = inject(AvatarService);
  ts = inject(TranslationService);

  currentNebulaColor = signal('#FF1744');
  secondaryNebulaColor = '#2979FF';
  isScrolled = signal(false);
  isSwapping = signal(false);
  currentHeroIconIndex = signal(0);
  
  stars = Array.from({ length: 100 }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 0.4 + 0.1,
    delay: Math.random() * 6 + 's'
  }));

  // Hero Icon Cycle (SVGs)
  private icons = [
    { id: 'spark', path: '/icons/spark.svg' },
    { id: 'cyberpunk', path: '/icons/cyberpunk.svg' },
    { id: 'fantasy', path: '/icons/fantasy.svg' },
    { id: 'horror', path: '/icons/horror.svg' },
    { id: 'space', path: '/icons/space_opera.svg' },
    { id: 'heroes', path: '/icons/heroes.svg' }
  ];

  heroCycle = computed(() => {
    return this.icons[this.currentHeroIconIndex() % this.icons.length];
  });

  cycleInterval: any;

  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('diversitySection') diversitySection!: ElementRef;
  @ViewChild('deepnessSection') deepnessSection!: ElementRef;
  @ViewChild('mirrorSection') mirrorSection!: ElementRef;
  @ViewChild('ctaSection') ctaSection!: ElementRef;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 80);
  }

  ngZone = inject(NgZone);
  private cycleInterval: any;

  async ngOnInit() {
    this.setupIntersectionObserver();
    
    // 1. Fetch and activate Remote Config
    await this.remoteConfigService.fetchAndActivate();
    
    // 2. Sync domain services (Always sync after fetch attempt)
    await Promise.all([
      this.genreConfigService.syncGenreConfigs(),
      this.avatarService.syncAvatars()
    ]);

    this.startIconCycle();
  }

  ngOnDestroy() { if (this.cycleInterval) clearInterval(this.cycleInterval); }

  startIconCycle() {
    // Run outside for performance, but run the updates inside the zone
    this.ngZone.runOutsideAngular(() => {
      this.cycleInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.isSwapping.set(true);
          
          setTimeout(() => {
            const nextIndex = (this.currentHeroIconIndex() + 1) % this.icons.length;
            this.currentHeroIconIndex.set(nextIndex);
            
            // Randomly shift nebula color on swap for "chaos/diversity" feel
            const colors = ['#FF1744', '#2979FF', '#4A00E0', '#00E676', '#FFD600'];
            this.setNebulaColor(colors[Math.floor(Math.random() * colors.length)]);
            
            this.isSwapping.set(false);
          }, 700);
        });
      }, 4000);
    });
  }

  setNebulaColor(color: string) { 
    this.currentNebulaColor.set(color); 
  }

  handleImageError(event: any) {
    const target = event.target;
    if (target.src.endsWith('/logo.svg')) {
      target.style.display = 'none';
      return;
    }
    target.src = '/logo.svg';
  }

  resolveUrl(url: string): string {
    if (!url) return '/logo.svg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  }

  setupIntersectionObserver() {
    const options = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animation logic for specific sections if needed
        }
      });
    }, options);

    setTimeout(() => {
      [
        this.heroSection, 
        this.diversitySection, 
        this.deepnessSection, 
        this.mirrorSection, 
        this.ctaSection
      ].forEach(el => { 
        if (el) observer.observe(el.nativeElement); 
      });
    }, 1500);
  }
}
