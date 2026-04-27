import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-soul-mirror',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mirror-box">
      <div class="liquid-mirror">
        <div class="reflection-core">
          <div class="echo e1"></div>
          <div class="echo e2"></div>
          <div class="echo e3"></div>
        </div>
        <div class="distortion-overlay"></div>
      </div>
      
      <!-- Emotional Beats (Floating Text Fragments) -->
      <div class="emotional-fragments">
        <div class="fragment" *ngFor="let frag of fragments"
             [style.left.%]="frag.x"
             [style.top.%]="frag.y"
             [style.animation-delay]="frag.delay">
          {{ frag.text }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mirror-box {
      position: relative;
      width: 400px;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .liquid-mirror {
      position: relative;
      width: 320px;
      height: 320px;
      background: radial-gradient(circle at 30% 30%, #1a1a1a 0%, #000 80%);
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      border: 1px solid rgba(255,255,255,0.15);
      animation: morph-liquid 10s infinite alternate ease-in-out;
      overflow: hidden;
      box-shadow: 0 0 100px rgba(255,255,255,0.05), inset 0 0 50px rgba(0,0,0,0.5);
    }

    .reflection-core {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%);
    }

    .echo {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 30% 70% 50% 50% / 50% 30% 70% 50%;
      animation: echo-pulse 5s infinite ease-out, morph-liquid 8s infinite alternate linear;
    }

    .e2 { animation-delay: 1.5s; width: 120px; height: 120px; opacity: 0.2; }
    .e3 { animation-delay: 3s; width: 160px; height: 160px; opacity: 0.1; }

    .distortion-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.03), transparent);
      height: 200%;
      animation: scanning 12s infinite linear;
    }

    .emotional-fragments {
      position: absolute;
      inset: -80px;
      pointer-events: none;
    }

    .fragment {
      position: absolute;
      font-size: 0.65rem;
      font-weight: 900;
      letter-spacing: 0.5em;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      animation: float-fragment 12s infinite ease-in-out;
      white-space: nowrap;
      text-shadow: 0 0 10px rgba(255,255,255,0.2);
    }

    @keyframes morph-liquid {
      0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
      50% { border-radius: 60% 40% 30% 70% / 50% 60% 40% 60%; }
      100% { border-radius: 70% 30% 40% 60% / 60% 40% 50% 40%; }
    }

    @keyframes echo-pulse {
      0% { transform: scale(0.6) rotate(0deg); opacity: 0; }
      50% { opacity: 0.4; }
      100% { transform: scale(2.2) rotate(180deg); opacity: 0; }
    }

    @keyframes scanning {
      0% { transform: translateY(-50%); }
      100% { transform: translateY(50%); }
    }

    @keyframes float-fragment {
      0% { transform: translate(0, 20px); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translate(var(--tx, 0), -150px); opacity: 0; }
    }
  `]
})
export class SoulMirrorComponent {
  fragments = [
    { text: 'REGRET', x: 15, y: 85, delay: '0s', tx: -20 },
    { text: 'VALOR', x: 75, y: 15, delay: '3s', tx: 30 },
    { text: 'BETRAYAL', x: 80, y: 70, delay: '6s', tx: 40 },
    { text: 'LEGACY', x: 5, y: 40, delay: '9s', tx: -30 },
    { text: 'SACRIFICE', x: 50, y: 95, delay: '1s', tx: 0 },
    { text: 'AMBITION', x: 85, y: 30, delay: '4s', tx: 50 },
    { text: 'IDENTITY', x: 30, y: 10, delay: '7s', tx: -10 },
    { text: 'THE ECHO', x: 60, y: 50, delay: '10s', tx: 20 }
  ];
}
