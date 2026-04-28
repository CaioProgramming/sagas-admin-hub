import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../services/translation.service';

interface EmotionState {
  id: string;
  color: string;
  volatility: number; // 0.5 (calm) to 2.5 (angry)
  cohesion: number;  // 0.8 (sad) to 1.5 (determined)
}

const EMOTIONS: EmotionState[] = [
  { id: 'neutral', color: '#B0BEC5', volatility: 1.0, cohesion: 1.0 },
  { id: 'calm', color: '#A5D6A7', volatility: 0.6, cohesion: 1.2 },
  { id: 'curious', color: '#FFF59D', volatility: 1.2, cohesion: 0.9 },
  { id: 'hopeful', color: '#81D4FA', volatility: 0.8, cohesion: 1.1 },
  { id: 'determined', color: '#FFAB91', volatility: 1.5, cohesion: 1.4 },
  { id: 'empathetic', color: '#CE93D8', volatility: 0.7, cohesion: 1.3 },
  { id: 'joyful', color: '#FFE082', volatility: 2.0, cohesion: 1.0 },
  { id: 'concerned', color: '#BCAAA4', volatility: 1.1, cohesion: 1.2 },
  { id: 'anxious', color: '#FFCC80', volatility: 2.5, cohesion: 0.7 },
  { id: 'frustrated', color: '#EF9A9A', volatility: 2.2, cohesion: 0.8 },
  { id: 'angry', color: '#D32F2F', volatility: 3.0, cohesion: 0.6 },
  { id: 'sad', color: '#90A4AE', volatility: 0.4, cohesion: 0.8 },
  { id: 'melancholic', color: '#7986CB', volatility: 0.5, cohesion: 0.9 },
  { id: 'cynical', color: '#757575', volatility: 0.9, cohesion: 1.1 }
];

@Component({
  selector: 'app-soul-mirror',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mirror-box">
      <!-- The Liquid Mirror (Metaball Simulation) -->
      <div class="liquid-container" 
           [style.color]="currentColor()"
           [style.--volatility]="currentVolatility()"
           [style.--cohesion]="currentCohesion()">
        <div class="blob core"></div>
        <div class="blob satellite s1"></div>
        <div class="blob satellite s2"></div>
        <div class="blob satellite s3"></div>
        <div class="blob satellite s4"></div>
        
        <!-- The "Soul" Core (Internal Glow) -->
        <div class="soul-inner"></div>
      </div>

      <!-- Floating Emotional Echoes -->
      <div class="synonym-cloud">
        <div *ngFor="let synonym of currentSynonyms(); let i = index" 
             class="synonym-echo"
             [style.animation-delay]="(i * 1.5) + 's'"
             [style.left.%]="synonymPositions[i].x"
             [style.top.%]="synonymPositions[i].y">
          {{ synonym }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mirror-box {
      position: relative;
      width: 100%;
      height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .liquid-container {
      position: relative;
      width: 300px;
      height: 300px;
      background: #000;
      filter: blur(25px) contrast(35) brightness(1.2);
      transition: color 2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .blob {
      position: absolute;
      background: currentColor;
      border-radius: 50%;
      transition: all 1s ease-in-out;
    }

    .core {
      width: 120px;
      height: 120px;
      animation: core-surge calc(4s / var(--volatility)) infinite ease-in-out;
    }

    .satellite {
      width: 60px;
      height: 60px;
      opacity: 0.8;
    }

    .s1 { animation: orbit-1 calc(8s / var(--volatility)) infinite linear; }
    .s2 { animation: orbit-2 calc(10s / var(--volatility)) infinite linear; }
    .s3 { animation: orbit-3 calc(12s / var(--volatility)) infinite linear; }
    .s4 { animation: orbit-4 calc(15s / var(--volatility)) infinite linear; }

    .soul-inner {
      position: absolute;
      width: 40px;
      height: 40px;
      background: #FFF;
      border-radius: 50%;
      filter: blur(5px);
      z-index: 10;
      opacity: 0.6;
      animation: soul-pulse 2s infinite ease-in-out;
    }

    .synonym-cloud {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 20;
    }

    .synonym-echo {
      position: absolute;
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #FFF;
      opacity: 0;
      animation: float-fade 6s infinite ease-in-out;
      white-space: nowrap;
      text-shadow: 0 0 10px rgba(255,255,255,0.5);
    }

    @keyframes core-surge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(calc(1.1 * var(--cohesion))); }
    }

    @keyframes orbit-1 {
      0% { transform: rotate(0deg) translate(80px) rotate(0deg); }
      100% { transform: rotate(360deg) translate(80px) rotate(-360deg); }
    }
    @keyframes orbit-2 {
      0% { transform: rotate(0deg) translate(-100px) rotate(0deg); }
      100% { transform: rotate(-360deg) translate(-100px) rotate(360deg); }
    }
    @keyframes orbit-3 {
      0% { transform: rotate(0deg) translateY(90px) rotate(0deg); }
      100% { transform: rotate(360deg) translateY(90px) rotate(-360deg); }
    }
    @keyframes orbit-4 {
      0% { transform: rotate(0deg) translateX(-110px) rotate(0deg); }
      100% { transform: rotate(-360deg) translateX(-110px) rotate(360deg); }
    }

    @keyframes soul-pulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.5); opacity: 0.8; }
    }

    @keyframes float-fade {
      0% { transform: translateY(20px); opacity: 0; }
      20% { opacity: 0.6; }
      80% { opacity: 0.6; }
      100% { transform: translateY(-20px); opacity: 0; }
    }

    .nebula-sparkles {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, #FFF 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle, black 0%, transparent 70%);
      opacity: 0.15;
      animation: shimmer 10s infinite linear;
    }

    @keyframes shimmer {
      0% { transform: scale(1) rotate(0deg); opacity: 0.1; }
      50% { transform: scale(1.1) rotate(180deg); opacity: 0.2; }
      100% { transform: scale(1) rotate(360deg); opacity: 0.1; }
    }
  `]
})
export class SoulMirrorComponent implements OnInit, OnDestroy {
  ts = inject(TranslationService);
  
  private currentIndex = signal(0);
  private intervalId: any;

  currentColor = computed(() => EMOTIONS[this.currentIndex()].color);
  currentVolatility = computed(() => EMOTIONS[this.currentIndex()].volatility);
  currentCohesion = computed(() => EMOTIONS[this.currentIndex()].cohesion);
  
  currentSynonyms = computed(() => {
    const emotion = EMOTIONS[this.currentIndex()].id;
    return this.ts.tList('synonyms_' + emotion);
  });

  synonymPositions = [
    { x: 10, y: 20 }, { x: 80, y: 15 }, { x: 20, y: 80 }, { x: 75, y: 85 },
    { x: 50, y: -10 }, { x: -15, y: 50 }, { x: 105, y: 45 }, { x: 45, y: 110 }
  ];

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentIndex.update(i => (i + 1) % EMOTIONS.length);
    }, 4000); // Slower, more atmospheric shifts
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

