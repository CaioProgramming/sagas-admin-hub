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
      <!-- The Morphing Shape (Hollow Energy Ring) -->
      <div class="emotion-shape-container" [style.color]="currentColor()">
        <!-- Multiple layers for the "hollow ring" effect -->
        <div class="emotion-layer layer-1"></div>
        <div class="emotion-layer layer-2"></div>
        <div class="emotion-layer layer-3"></div>
        <div class="emotion-layer layer-4"></div>
        <div class="emotion-layer layer-5"></div>
        <div class="emotion-layer layer-6"></div>
      </div>
    </div>
  `,
  styles: [`
    .mirror-box {
      position: relative;
      width: 400px;
      height: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .emotion-shape-container {
      position: relative;
      width: 260px;
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      /* The drop shadow enhances the overall glow of the combined lines */
      filter: drop-shadow(0 0 20px currentColor);
      transition: color 1s ease;
    }

    .emotion-layer {
      position: absolute;
      inset: 0;
      border: solid currentColor;
      background-color: transparent;
      mix-blend-mode: screen;
      box-shadow: inset 0 0 15px currentColor, 0 0 15px currentColor;
      transition: color 1s ease;
    }

    /* Morphing Animations - Sped up for high energy */
    .layer-1 { animation: morph1 4s infinite linear, spin 8s infinite linear; scale: 1; opacity: 0.9; border-width: 1px; }
    .layer-2 { animation: morph2 5s infinite linear, spin 10s infinite linear reverse; scale: 0.98; opacity: 0.7; border-width: 2px; }
    .layer-3 { animation: morph3 6s infinite linear, spin 12s infinite linear; scale: 0.95; opacity: 0.5; border-width: 1px; }
    .layer-4 { animation: morph1 7s infinite linear reverse, spin 14s infinite linear reverse; scale: 0.92; opacity: 0.6; border-width: 3px; }
    .layer-5 { animation: morph2 8s infinite linear reverse, spin 16s infinite linear; scale: 1.02; opacity: 0.4; border-width: 1px; }
    .layer-6 { animation: morph3 9s infinite linear reverse, spin 18s infinite linear reverse; scale: 0.88; opacity: 0.8; border-width: 2px; }



    @keyframes morph1 {
      0% { border-radius: 30% 70% 20% 80% / 80% 20% 70% 30%; }
      33% { border-radius: 70% 30% 80% 20% / 20% 80% 30% 70%; }
      66% { border-radius: 20% 80% 30% 70% / 70% 30% 80% 20%; }
      100% { border-radius: 30% 70% 20% 80% / 80% 20% 70% 30%; }
    }

    @keyframes morph2 {
      0% { border-radius: 80% 20% 70% 30% / 30% 70% 20% 80%; }
      33% { border-radius: 30% 70% 20% 80% / 80% 20% 70% 30%; }
      66% { border-radius: 70% 30% 80% 20% / 20% 80% 30% 70%; }
      100% { border-radius: 80% 20% 70% 30% / 30% 70% 20% 80%; }
    }

    @keyframes morph3 {
      0% { border-radius: 20% 80% 30% 70% / 70% 30% 80% 20%; }
      33% { border-radius: 80% 20% 70% 30% / 30% 70% 20% 80%; }
      66% { border-radius: 30% 70% 20% 80% / 80% 20% 70% 30%; }
      100% { border-radius: 20% 80% 30% 70% / 70% 30% 80% 20%; }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class SoulMirrorComponent implements OnInit, OnDestroy {
  ts = inject(TranslationService);
  
  private currentIndex = signal(0);
  private intervalId: any;

  currentColor = computed(() => EMOTIONS[this.currentIndex()].color);

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentIndex.update(i => (i + 1) % EMOTIONS.length);
    }, 2500); // Shift energy rapidly every 2.5 seconds
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

