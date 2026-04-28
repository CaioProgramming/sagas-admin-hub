import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../services/translation.service';

interface EmotionState {
  id: string;
  color: string;
}

const EMOTIONS: EmotionState[] = [
  { id: 'neutral', color: '#B0BEC5' },
  { id: 'calm', color: '#A5D6A7' },
  { id: 'curious', color: '#FFF59D' },
  { id: 'hopeful', color: '#81D4FA' },
  { id: 'determined', color: '#FFAB91' },
  { id: 'empathetic', color: '#CE93D8' },
  { id: 'joyful', color: '#FFE082' },
  { id: 'concerned', color: '#BCAAA4' },
  { id: 'anxious', color: '#FFCC80' },
  { id: 'frustrated', color: '#EF9A9A' },
  { id: 'angry', color: '#D32F2F' },
  { id: 'sad', color: '#90A4AE' },
  { id: 'melancholic', color: '#7986CB' },
  { id: 'cynical', color: '#757575' }
];

@Component({
  selector: 'app-soul-mirror',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mirror-box">
      <!-- The Nebula Aura (Emotional Resonance) -->
      <div class="nebula-container" [style.color]="currentColor()">
        <div class="nebula-core"></div>
        <div class="nebula-cloud cloud-1"></div>
        <div class="nebula-cloud cloud-2"></div>
        <div class="nebula-cloud cloud-3"></div>
        
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
    </div>
  `,
  styles: [`
    .mirror-box {
      position: relative;
      width: 100%;
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nebula-container {
      position: relative;
      width: 350px;
      height: 350px;
      transition: color 2s ease;
    }

    .nebula-core {
      position: absolute;
      inset: 20%;
      background: currentColor;
      filter: blur(60px);
      opacity: 0.4;
      border-radius: 50%;
      animation: pulse-core 4s infinite ease-in-out;
    }

    .nebula-cloud {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle, currentColor 0%, transparent 70%);
      filter: blur(40px);
      mix-blend-mode: screen;
    }

    .cloud-1 { animation: drift 12s infinite linear; opacity: 0.3; scale: 1.2; }
    .cloud-2 { animation: drift 15s infinite linear reverse; opacity: 0.2; scale: 1.5; }
    .cloud-3 { animation: drift 20s infinite ease-in-out; opacity: 0.25; scale: 1.3; }

    .synonym-cloud {
      position: absolute;
      inset: -50px;
      pointer-events: none;
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

    @keyframes pulse-core {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.2); opacity: 0.6; }
    }

    @keyframes drift {
      0% { transform: rotate(0deg) translate(20px) rotate(0deg); }
      100% { transform: rotate(360deg) translate(20px) rotate(-360deg); }
    }

    @keyframes float-fade {
      0% { transform: translateY(20px); opacity: 0; }
      20% { opacity: 0.4; }
      80% { opacity: 0.4; }
      100% { transform: translateY(-20px); opacity: 0; }
    }
  `]
})
export class SoulMirrorComponent implements OnInit, OnDestroy {
  ts = inject(TranslationService);
  
  private currentIndex = signal(0);
  private intervalId: any;

  currentColor = computed(() => EMOTIONS[this.currentIndex()].color);
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

