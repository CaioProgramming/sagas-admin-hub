import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../services/translation.service';

interface EmotionState {
  id: string;
  colors: string[];
  spikeFrequency: number; // How many spikes
  spikeIntensity: number; // How long they are
  pulseSpeed: number;     // How fast they move
  roughness: number;      // How sharp they are
}

const EMOTIONS: EmotionState[] = [
  { id: 'neutral', colors: ['#90A4AE', '#455A64'], spikeFrequency: 0, spikeIntensity: 0, pulseSpeed: 0.1, roughness: 0 },
  { id: 'calm', colors: ['#A5D6A7', '#2E7D32'], spikeFrequency: 2, spikeIntensity: 0.8, pulseSpeed: 0.3, roughness: 0.05 },
  { id: 'joyful', colors: ['#FFF176', '#F9A825'], spikeFrequency: 5, spikeIntensity: 3, pulseSpeed: 0.8, roughness: 0.2 },
  { id: 'hopeful', colors: ['#81D4FA', '#0288D1'], spikeFrequency: 3, spikeIntensity: 2.5, pulseSpeed: 0.6, roughness: 0.1 },
  { id: 'determined', colors: ['#FFAB91', '#D84315'], spikeFrequency: 6, spikeIntensity: 5, pulseSpeed: 0.8, roughness: 0.3 },
  { id: 'empathetic', colors: ['#E1BEE7', '#8E24AA'], spikeFrequency: 2, spikeIntensity: 1.5, pulseSpeed: 0.4, roughness: 0.05 },
  { id: 'concerned', colors: ['#D7CCC8', '#5D4037'], spikeFrequency: 8, spikeIntensity: 2.5, pulseSpeed: 1.2, roughness: 0.2 },
  { id: 'anxious', colors: ['#FFE0B2', '#FF8F00'], spikeFrequency: 12, spikeIntensity: 1.5, pulseSpeed: 1.5, roughness: 0.4 },
  { id: 'frustrated', colors: ['#FFCDD2', '#C62828'], spikeFrequency: 10, spikeIntensity: 6, pulseSpeed: 1.2, roughness: 0.5 },
  { id: 'angry', colors: ['#EF5350', '#B71C1C'], spikeFrequency: 5, spikeIntensity: 10, pulseSpeed: 1.5, roughness: 0.6 },
  { id: 'sad', colors: ['#CFD8DC', '#37474F'], spikeFrequency: 1, spikeIntensity: 0.8, pulseSpeed: 0.1, roughness: 0.02 },
  { id: 'melancholic', colors: ['#C5CAE9', '#283593'], spikeFrequency: 2, spikeIntensity: 2.5, pulseSpeed: 0.2, roughness: 0.05 },
  { id: 'cynical', colors: ['#B0BEC5', '#37474F'], spikeFrequency: 4, spikeIntensity: 4, pulseSpeed: 0.1, roughness: 0.3 }
];

@Component({
  selector: 'app-soul-mirror',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mirror-box" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
      <svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
        <defs>
          <filter id="bubble-polished" x="-50%" y="-50%" width="200%" height="200%">
            <!-- 1. Space Distortion -->
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" result="distorted" />
            
            <!-- 2. Brilliant Rim Bloom -->
            <feGaussianBlur in="distorted" stdDeviation="2" result="rimBlur" />
            <feColorMatrix in="rimBlur" type="matrix" values="1.5 0 0 0 0  0 1.5 0 0 0  0 0 1.8 0 0  0 0 0 1.6 0" result="rimGlow" />

            <!-- 3. Specular Surface -->
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blurAlpha" />
            <feSpecularLighting in="blurAlpha" surfaceScale="18" specularConstant="4.5" specularExponent="100" lighting-color="#ffffff" result="specHighlight">
              <fePointLight x="-70" y="-70" z="200" />
            </feSpecularLighting>
            <feComposite in="specHighlight" in2="SourceAlpha" operator="in" result="specFinal" />

            <feMerge>
              <feMergeNode in="rimGlow" />
              <feMergeNode in="distorted" />
              <feMergeNode in="specFinal" />
            </feMerge>
          </filter>

          <radialGradient id="bubble-hollow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(0,0,0,0.2)" />
            <stop offset="85%" stop-color="rgba(255,255,255,0.02)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.1)" />
          </radialGradient>

          <radialGradient id="rim-light-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="transparent" />
            <stop offset="85%" stop-color="transparent" />
            <stop offset="95%" [attr.stop-color]="currentColors()[0]" stop-opacity="0.6" />
            <stop offset="100%" [attr.stop-color]="currentColors()[1]" stop-opacity="0.9" />
          </radialGradient>

          <linearGradient id="ethereal-iridescence" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(212, 195, 252, 0.25)">
              <animate attributeName="stop-color" values="rgba(212, 195, 252, 0.25); rgba(245, 197, 230, 0.25); rgba(181, 232, 255, 0.25); rgba(212, 195, 252, 0.25)" dur="12s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stop-color="rgba(181, 232, 255, 0.1)">
              <animate attributeName="stop-color" values="rgba(181, 232, 255, 0.1); rgba(212, 195, 252, 0.1); rgba(245, 197, 230, 0.1); rgba(181, 232, 255, 0.1)" dur="12s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <radialGradient id="glint-soft">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#fff" stop-opacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div class="soul-container">
        <!-- Background Aura -->
        <div class="soul-aura" [style.background]="currentColors()[0]"></div>

        <!-- The Chrome Spike Orb -->
        <svg viewBox="0 0 150 150" 
             class="soul-canvas" 
             filter="url(#bubble-polished)"
             [style.transform]="'translateY(' + levitationY + 'px)'">
          <!-- 1. Volumetric Bubble Core (Ultra-Clear Center) -->
          <path [attr.d]="orbPath()" 
                fill="url(#bubble-hollow)" />

          <!-- 2. Ethereal Iridescent Surface (Reduced Opacity) -->
          <path [attr.d]="orbPath()" 
                fill="url(#ethereal-iridescence)" 
                style="opacity: 0.4; mix-blend-mode: screen;" />
          
          <!-- 3. Rim Light Effect (Energy Catch at Edge) -->
          <path [attr.d]="orbPath()" 
                fill="url(#rim-light-grad)" 
                stroke="white"
                stroke-width="0.3"
                style="opacity: 0.9; mix-blend-mode: plus-lighter;" />
          
          <!-- 4. Dynamic Specular Glints (Polished Hotspots) -->
          <path [attr.d]="glintPath(0)" 
                fill="url(#glint-soft)" />
          
          <path [attr.d]="glintPath(1)" 
                fill="url(#glint-soft)" 
                style="opacity: 0.4;" />

          <!-- 5. Cosmic Dust Atmosphere -->
          <circle *ngFor="let p of particles" 
                  [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="p.r" 
                  fill="white" style="opacity: 0.2; filter: blur(1.5px); animation: sparkle 8s infinite ease-in-out;" 
                  [style.animation-delay]="p.delay" />
        </svg>
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

    .soul-container {
      position: relative;
      width: 400px;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .soul-aura {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.3;
      transition: background 2s ease;
      animation: pulse-aura 6s infinite ease-in-out;
    }

    .soul-canvas {
      position: relative;
      width: 320px;
      height: 320px;
      z-index: 10;
      filter: drop-shadow(0 0 30px rgba(0,0,0,0.8));
      overflow: visible;
    }

    @keyframes pulse-aura {
      0%, 100% { transform: scale(1); opacity: 0.1; }
      50% { transform: scale(1.2); opacity: 0.2; }
    }

    @keyframes float-fade {
      0% { transform: translateY(20px); opacity: 0; }
      20% { opacity: 0.6; }
      80% { opacity: 0.6; }
      100% { transform: translateY(-20px); opacity: 0; }
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

    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
      0% { transform: scale(1) rotate(0deg); opacity: 0.2; }
      50% { transform: scale(1.1) rotate(180deg); opacity: 0.4; }
      100% { transform: scale(1) rotate(360deg); opacity: 0.2; }
    }

    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50% { opacity: 0.8; transform: scale(1.2); }
    }
  `]
})
export class SoulMirrorComponent implements OnInit, OnDestroy {
  private currentIndex = signal(0);
  currentColors = computed(() => EMOTIONS[this.currentIndex()].colors);
  orbPath = signal('');
  
  private mousePos = { x: -1, y: -1 };
  private smoothedMouse = { x: 50, y: 50, active: 0 }; // active: 0-1 lerp
  
  // Interpolated Render State (Lerped values to prevent popping)
  private renderState = {
    freq: 0,
    intensity: 0,
    speed: 0,
    rough: 0
  };

  private time = 0;
  private animationId?: number;
  private emotionInterval?: any;
  levitationY = 0;
  
  particles = Array.from({ length: 8 }).map(() => ({
    x: 75 + (Math.random() - 0.5) * 40,
    y: 75 + (Math.random() - 0.5) * 40,
    r: Math.random() * 0.8 + 0.2,
    delay: Math.random() * 4 + 's'
  }));

  ngOnInit() {
    this.startAnimation();
    this.emotionInterval = setInterval(() => {
      this.currentIndex.update(i => (i + 1) % EMOTIONS.length);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.emotionInterval) clearInterval(this.emotionInterval);
  }

  onMouseMove(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.mousePos = {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100
    };
  }

  onMouseLeave() {
    this.mousePos = { x: -1, y: -1 };
  }

  private startAnimation() {
    const animate = () => {
      this.time += 0.008; // Ultra-slow, serene pulse
      this.levitationY = Math.sin(this.time * 0.5) * 10; // Smooth 10px levitation
      this.updateRenderState();
      this.generateOrbPath();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  private updateRenderState() {
    const target = EMOTIONS[this.currentIndex()];
    const lerpFactor = 0.01; // Extremely slow, tranquil transition

    // Lerp emotional parameters
    this.renderState.freq += (target.spikeFrequency - this.renderState.freq) * lerpFactor;
    this.renderState.intensity += (target.spikeIntensity - this.renderState.intensity) * lerpFactor;
    this.renderState.speed += (target.pulseSpeed - this.renderState.speed) * lerpFactor;
    this.renderState.rough += (target.roughness - this.renderState.rough) * lerpFactor;

    // Lerp mouse position and activation
    if (this.mousePos.x !== -1) {
      this.smoothedMouse.x += (this.mousePos.x - this.smoothedMouse.x) * 0.1;
      this.smoothedMouse.y += (this.mousePos.y - this.smoothedMouse.y) * 0.1;
      this.smoothedMouse.active += (1 - this.smoothedMouse.active) * 0.05;
    } else {
      this.smoothedMouse.active += (0 - this.smoothedMouse.active) * 0.05;
    }
  }

  glintPath(index: number) {
    const center = 75;
    const offset = index === 0 ? -12 : 14;
    const size = index === 0 ? 8 : 4;
    
    // Dynamic 'drifting' movement across the surface
    const driftX = Math.sin(this.time * 0.4 + index) * 6;
    const driftY = Math.cos(this.time * 0.3 + index) * 4;
    
    const cx = center - 8 + driftX;
    const cy = center + offset + driftY;
    
    return `M ${cx},${cy} a ${size},${size/2} 0 1,0 ${size*2},0 a ${size},${size/2} 0 1,0 -${size*2},0`;
  }

  private generateOrbPath() {
    const center = 75; // Centered in 150x150 viewBox
    const baseRadius = 28;
    const points = 120; // High resolution for liquid smoothness
    let pathData = '';

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      
      // 1. Stationary Emotional Pulsing (Subtle ripples)
      const pulseNoise = Math.sin(angle * this.renderState.freq) * Math.sin(this.time * this.renderState.speed);
      const spikeValue = pulseNoise * (this.renderState.intensity * 0.3); // 0.3x Damping for minimal ripples
      
      // 2. Roughness (Minimal)
      const jitter = Math.sin(angle * 80 + this.time * 2) * (this.renderState.rough * 1.5);
      
      // 3. Smooth Mouse Influence
      let mouseInfluence = 0;
      if (this.smoothedMouse.active > 0.01) {
        const px = center + Math.cos(angle) * baseRadius;
        const py = center + Math.sin(angle) * baseRadius;
        const dx = px - this.smoothedMouse.x;
        const dy = py - this.smoothedMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 45) {
          // Subtle, smooth pull
          mouseInfluence = (45 - dist) * 0.4 * this.smoothedMouse.active;
        }
      }

      const r = baseRadius + spikeValue + jitter + mouseInfluence;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;

      if (i === 0) pathData += `M ${x},${y}`;
      else pathData += ` L ${x},${y}`;
    }
    
    this.orbPath.set(pathData + ' Z');
  }
}

