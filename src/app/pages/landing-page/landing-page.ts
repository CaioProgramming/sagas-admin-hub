import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, ViewChildren, QueryList, inject, OnDestroy, HostListener, signal, computed, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RemoteConfigService } from '../../services/remote-config.service';
import { GenreConfigService } from '../../services/genre-config.service';
import { AvatarService } from '../../services/avatar.service';
import { TranslationService } from '../../services/translation.service';
import { SoulKeyService } from '../../services/soul-key.service';
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
          <div class="star-hero" *ngFor="let star of stars" #starElement
               [style.left.%]="star.x" 
               [style.top.%]="star.y"
               [style.animation-delay]="star.delay">
          </div>
        </div>
        <div class="mouse-spotlight" #spotlight></div>
        <div class="cosmic-grain"></div>
      </div>

      <!-- Floating Section Navigation -->
      <div class="section-navigation" [class.is-visible]="isScrolled()">
        <button *ngFor="let section of sections; let i = index" 
                class="nav-star-btn" 
                [class.active]="activeSection() === section.id"
                (click)="scrollToSection(section.id)"
                [title]="ts.t(section.labelKey)">
          <svg class="nav-star-icon" viewBox="0 0 110 135">
            <path d="M54.17,110v-0.01,0.01c-2.02,-38.31 -5.69,-59.67 -38.07,-61.94 20.18,0 36.69,-15.7 37.98,-35.56l0.08,-2.29v-0.07,0.04l0.01,-0.04c0.07,20.97 17.08,37.92 38.06,37.92 -32.38,2.27 -36.06,23.63 -38.06,61.94z" fill="currentColor"/>
          </svg>
          <span class="dot-label">{{ ts.t(section.labelKey) }}</span>
        </button>
      </div>

      <!-- Safari-Style Floating Top Bar -->
      <nav class="top-nav" [class.is-visible]="isScrolled()">
        <div class="nav-brand" (click)="goToAdmin()" [style.cursor]="canAccessAdmin() ? 'pointer' : 'default'">
          <svg class="nav-spark" viewBox="0 0 110 135" xmlns="http://www.w3.org/2000/svg" [class.is-admin]="canAccessAdmin()">
            <path d="M54.17,110v-0.01,0.01c-2.02,-38.31 -5.69,-59.67 -38.07,-61.94 20.18,0 36.69,-15.7 37.98,-35.56l0.08,-2.29v-0.07,0.04l0.01,-0.04c0.07,20.97 17.08,37.92 38.06,37.92 -32.38,2.27 -36.06,23.63 -38.06,61.94z" fill="currentColor"/>
          </svg>
          <span class="brand-name">SAGAS</span>
        </div>
      </nav>

      <div class="main-content">
        <section class="hero-section" #heroSection id="hero">
          <div class="entrance-monolith">
            
            <div class="hero-spark-container">
              <div class="hero-spark-wrapper" [class.is-swapping]="isSwapping()">
                <div class="genre-icon-mask" [style.--icon-url]="'url(' + heroCycle().path + ')'"></div>
              </div>
            </div>
            
            <h1 class="display-lg typewriter-title">
              <span class="placeholder">{{ fullPrefix() }}{{ longestWord() }}|</span>
              <span class="typing-content">
                {{ typewriterPrefix() }}<span class="cosmic-highlight">{{ typewriterWord() }}</span><span class="cursor" [class.blink]="isCursorBlinking()">|</span>
              </span>
            </h1>
            <p class="marketing-sub fade-in" [class.visible]="showSubtitle()">{{ ts.t('hero_subtitle') }}</p>

            <!-- Scroll Down Indicator -->
            <div class="scroll-indicator fade-in" [class.visible]="showSubtitle()" (click)="scrollToSection('diversity')">
              <span class="scroll-text">{{ ts.t('explore_universe') }}</span>
              <div class="scroll-arrow">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5"></path>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <!-- Diversity Section -->
        <section class="experience-block carousel-block" #diversitySection id="diversity">
          <div class="ambient-glow" [style.background]="'radial-gradient(circle at 50% 50%, ' + currentNebulaColor() + '25 0%, transparent 70%)'"></div>
          <div class="monolith-text" [class.is-revealed]="diversityRevealed()">
            <h2 class="section-tag" [style.color]="currentNebulaColor()">{{ ts.t('diversity_tag') }}</h2>
            <h3 class="display-md">{{ ts.t('diversity_title') }}</h3>
            <p class="section-desc">{{ ts.t('diversity_desc') }}</p>
            
            <app-genre-carousel [isRevealed]="diversityRevealed()" (genreHover)="setNebulaColor($event)"></app-genre-carousel>
          </div>
        </section>

        <section class="experience-block" #deepnessSection id="deepness">
          <div class="split-layout">
            <div class="monolith-text" [class.is-revealed]="deepnessRevealed()">
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
        <section class="experience-block" #mirrorSection id="mirror">
          <div class="split-layout reverse">
            <div class="visual-monolith">
              <app-soul-mirror></app-soul-mirror>
            </div>
            <div class="monolith-text" [class.is-revealed]="mirrorRevealed()">
              <h2 class="section-tag" [style.color]="currentNebulaColor()">{{ ts.t('mirror_tag') }}</h2>
              <h3 class="display-md mirror-title-animate">
                <span *ngFor="let word of mirrorTitleWords(); let i = index"
                      class="mirror-word"
                      [style.transition-delay]="(i * 0.15) + 's'">
                  <span [class.cosmic-highlight]="i >= mirrorTitleWords().length - 2">{{ word }}</span>&nbsp;
                </span>
              </h3>
              <p class="section-desc">{{ ts.t('mirror_desc') }}</p>
            </div>
          </div>
        </section>

        <section class="cta-section" #ctaSection id="cta">
          <div class="monolith-cta" [class.is-revealed]="ctaRevealed()">
            <h2 class="display-lg" style="margin-bottom: 2rem; min-height: 1.2em; display: flex; justify-content: center; align-items: center; white-space: pre;">
              {{ ctaTypewriterPrefix() }}<span class="cosmic-highlight">{{ ctaTypewriterWord() }}</span><span class="cursor" [class.blink]="isCtaCursorBlinking()">|</span>
            </h2>
            <button class="btn-download" (click)="onStoreRedirect()">{{ ts.t('hero_btn') }}</button>
          </div>
        </section>
      </div>

      <!-- Store Redirect Modal -->
      <div class="custom-modal-backdrop" [class.is-visible]="showStoreModal()" (click)="showStoreModal.set(false)">
        <div class="custom-modal" (click)="$event.stopPropagation()">
          <div class="modal-icon">
            <svg *ngIf="!modalData().url" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <svg *ngIf="modalData().url" viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"></path>
            </svg>
          </div>
          <h3 class="modal-title">{{ modalData().title }}</h3>
          <p class="modal-message">{{ modalData().message }}</p>
          <div class="modal-actions">
            <button *ngIf="modalData().url" class="modal-btn primary" (click)="openUrl(modalData().url)">{{ ts.t('open_store') }}</button>
            <button class="modal-btn" (click)="showStoreModal.set(false)">{{ modalData().url ? 'CLOSE' : 'OK' }}</button>
          </div>
        </div>
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
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
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
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.6); } 50% { opacity: 0.8; transform: scale(1.1); } }

    .top-nav { 
      position: fixed; top: calc(1.5rem + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%) translateY(-150%);
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
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease-in-out, opacity 0.5s ease-in-out;
    }
    .hero-spark-wrapper.is-swapping { transform: scale(0.6) rotate(-20deg); filter: blur(12px); opacity: 0; }

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
      0%, 100% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 10px rgba(212, 195, 252, 0.4)); }
      50% { transform: scale(1.1); filter: brightness(1.2) drop-shadow(0 0 20px rgba(245, 197, 230, 0.6)); }
    }

    .cosmic-grain {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E");
      z-index: 15; opacity: 0.05; pointer-events: none;
    }

    .mouse-spotlight {
      position: fixed;
      top: 0; left: 0;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle at center, rgba(41, 121, 255, 0.12) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 10;
      mix-blend-mode: screen;
      filter: blur(40px);
    }

    .entrance-monolith { 
      width: 100%; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      text-align: center; 
    }

    .display-lg { font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 900; line-height: 0.9; margin: 0; text-transform: uppercase; color: #FFF; }
    
    /* Typewriter Styles */
    .typewriter-title { position: relative; display: inline-block; text-align: left; min-height: 1.2em; white-space: pre; }
    .placeholder { visibility: hidden; pointer-events: none; user-select: none; display: flex; align-items: center; white-space: pre; }
    .typing-content { position: absolute; top: 0; left: 0; white-space: pre; display: flex; align-items: center; }
    
    .cosmic-highlight {
      background: linear-gradient(-45deg, #D4C3FC 0%, #F5C5E6 25%, #FFF2B2 50%, #B5E8FF 75%, #D4C3FC 100%);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
      animation: holo-shimmer 4s infinite linear;
      filter: drop-shadow(0 0 12px rgba(245, 197, 230, 0.6)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
    }
    
    .cursor { color: #FFF; font-weight: 100; margin-left: 5px; opacity: 1; transition: opacity 0.1s; }
    .cursor.blink { animation: text-blink 1s step-end infinite; }
    
    @keyframes holo-shimmer {
      0% { background-position: 200% center; }
      100% { background-position: 0% center; }
    }
    @keyframes text-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* Subtitle Fade In */
    .marketing-sub { font-size: clamp(1rem, 1.8vw, 1.4rem); margin-top: 2rem; color: #AAA; font-weight: 500; max-width: 700px; line-height: 1.5; }
    .marketing-sub.fade-in { opacity: 0; transform: translateY(20px); transition: opacity 1s ease, transform 1s ease; }
    .marketing-sub.fade-in.visible { opacity: 1; transform: translateY(0); }

    section { padding: 0 10vw; min-height: 100vh; display: flex; align-items: center; position: relative; }
    .section-tag { 
      font-size: 0.75rem; font-weight: 900; letter-spacing: 0.6em; 
      margin-bottom: 2rem; opacity: 0.6; text-transform: uppercase;
      transition: all 1s ease;
    }
    .display-md { font-size: clamp(2rem, 5vw, 4rem); font-weight: 900; line-height: 1.1; margin-bottom: 3rem; color: #FFF; }
    .section-desc { font-size: clamp(1rem, 1.8vw, 1.6rem); color: #BBB; line-height: 1.6; max-width: 800px; }

    .carousel-block { min-height: 130vh; padding: 15vh 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; overflow: hidden; }
    .ambient-glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; mix-blend-mode: screen; filter: blur(60px); transition: background 1.5s ease; }
    .carousel-block .monolith-text { width: 100%; margin-top: 5vh; position: relative; z-index: 1; padding: 0 10vw; }

    /* Snap Reveal Typography */
    .monolith-text .display-md {
      transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      letter-spacing: 0.6em;
      filter: blur(20px);
      opacity: 0;
      transform: translateY(30px);
    }
    .monolith-text.is-revealed .display-md {
      letter-spacing: normal;
      filter: blur(0px);
      opacity: 1;
      transform: translateY(0);
    }

    .monolith-text .display-md.mirror-title-animate {
      opacity: 1; filter: none; transform: none; letter-spacing: normal;
    }

    .mirror-word {
      display: inline-block;
      opacity: 0;
      filter: blur(24px);
      transform: scale(1.1);
      transition: all 1.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .monolith-text.is-revealed .mirror-word {
      opacity: 1;
      filter: blur(0px);
      transform: scale(1);
    }

    .monolith-text.is-revealed .mirror-word .cosmic-highlight {
      animation: holo-shimmer 4s infinite linear, text-glow-pulse 3s infinite alternate;
    }

    @keyframes text-glow-pulse {
      0% { filter: drop-shadow(0 0 8px rgba(245, 197, 230, 0.3)); }
      100% { filter: drop-shadow(0 0 16px rgba(212, 195, 252, 0.6)); }
    }

    .monolith-text .section-desc {
      transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
      opacity: 0;
      transform: translateY(20px);
    }
    .monolith-text.is-revealed .section-desc {
      opacity: 1;
      transform: translateY(0);
    }

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

    .split-layout .monolith-text {
      flex: 1;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 2;
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

    .section-navigation {
      position: fixed; right: 2rem; top: 50%; transform: translateY(-50%) translateX(100px);
      display: flex; flex-direction: column; gap: 1.5rem; z-index: 100;
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0;
    }
    .section-navigation.is-visible { transform: translateY(-50%) translateX(0); opacity: 1; }

    .nav-star-btn {
      background: none; border: none; width: 24px; height: 24px;
      cursor: pointer; position: relative; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.3);
    }
    .nav-star-icon { width: 14px; height: 14px; transition: all 0.6s; }
    .nav-star-btn:hover { color: rgba(255,255,255,0.8); transform: scale(1.2); }
    .nav-star-btn.active { color: #FFF; transform: scale(1.4); }
    .nav-star-btn.active .nav-star-icon { filter: drop-shadow(0 0 8px #FFF); }

    .dot-label {
      position: absolute; right: 3rem; top: 50%; transform: translateY(-50%);
      font-size: 0.65rem; font-weight: 900; letter-spacing: 0.3em; color: #FFF;
      opacity: 0; pointer-events: none; transition: all 0.4s; white-space: nowrap;
      background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem; border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .nav-star-btn:hover .dot-label { opacity: 0.8; transform: translateY(-50%) translateX(-10px); }

    .scroll-indicator {
      margin-top: 5rem;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      cursor: pointer; opacity: 0; transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s;
      z-index: 10;
    }
    .scroll-indicator.visible { opacity: 0.6; transform: translateY(0); }
    .scroll-indicator:not(.visible) { transform: translateY(30px); }
    .scroll-indicator:hover { opacity: 1; transform: translateY(-5px); }
    .scroll-text { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.4em; color: #FFF; }
    .scroll-arrow { animation: bounce 2s infinite; }

    @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }

    .nav-spark.is-admin { 
      filter: drop-shadow(0 0 8px var(--nebula-color));
      animation: admin-glow 2s infinite alternate;
    }
    @keyframes admin-glow { from { filter: drop-shadow(0 0 4px var(--nebula-color)); } to { filter: drop-shadow(0 0 12px var(--nebula-color)); } }

    /* Custom Modal */
    .custom-modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
    }
    .custom-modal-backdrop.is-visible { opacity: 1; pointer-events: all; }
    
    .custom-modal {
      background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
      padding: 3rem 2.5rem; width: 90%; max-width: 400px; text-align: center;
      transform: translateY(20px) scale(0.95); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,255,255,0.05);
    }
    .custom-modal-backdrop.is-visible .custom-modal { transform: translateY(0) scale(1); }
    
    .modal-icon { color: #FFF; margin-bottom: 1.5rem; opacity: 0.8; }
    .modal-title { font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; letter-spacing: 0.1em; }
    .modal-message { font-size: 1rem; color: #AAA; line-height: 1.6; margin-bottom: 2.5rem; }
    
    .modal-actions {
      display: flex; gap: 1rem; justify-content: center;
    }
    
    .modal-btn {
      background: rgba(255,255,255,0.1); color: #FFF; font-weight: 900; font-size: 0.8rem;
      padding: 0.8rem 2rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer;
      transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.1em;
    }
    .modal-btn.primary {
      background: #FFF; color: #000; border: none;
    }
    .modal-btn:hover { transform: scale(1.05); background: rgba(255,255,255,0.2); }
    .modal-btn.primary:hover { background: #E2E2E2; }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .top-nav { width: 95vw; padding: 0.6rem 1.5rem; }
      .brand-name { letter-spacing: 0.2em; font-size: 0.8rem; }
      .section-navigation { display: none; }
      
      section { padding: 0 5vw; }
      .display-lg { font-size: clamp(2rem, 10vw, 3rem); }
      .display-md { font-size: 1.8rem; }
      .section-desc { font-size: 1rem; }
      
      .split-layout { flex-direction: column !important; text-align: center; gap: 4rem; }
      .split-layout .monolith-text { align-items: center; }
      
      .hero-spark-container { height: 100px; }
      .genre-icon-mask { width: 50px; height: 50px; }
      
      .btn-download { padding: 1.2rem 2.5rem; font-size: 1rem; margin-top: 4rem; }
      
      .typewriter-title { white-space: normal; text-align: center; width: 100%; display: block; }
      .placeholder { display: none; }
      .typing-content { position: relative; display: inline; white-space: normal; }
      .cursor { display: none; }
    }
  `]
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  remoteConfigService = inject(RemoteConfigService);
  genreConfigService = inject(GenreConfigService);
  avatarService = inject(AvatarService);
  soulKeyService = inject(SoulKeyService);
  ts = inject(TranslationService);
  router = inject(Router);

  currentNebulaColor = signal('#FF1744');
  isScrolled = signal(false);
  isSwapping = signal(false);
  currentHeroIconIndex = signal(0);
  diversityRevealed = signal(false);
  deepnessRevealed = signal(false);
  mirrorRevealed = signal(false);
  ctaRevealed = signal(false);
  canAccessAdmin = signal(false);

  activeSection = signal('hero');
  sections = [
    { id: 'hero', labelKey: 'nav_craft' },
    { id: 'diversity', labelKey: 'nav_genres' },
    { id: 'deepness', labelKey: 'nav_soul' },
    { id: 'mirror', labelKey: 'nav_mirror' },
    { id: 'cta', labelKey: 'nav_begin' }
  ];
  
  // Typewriter Signals
  fullPrefix = signal('');
  typewriterPrefix = signal('');
  typewriterWord = signal('');
  longestWord = signal('UNIVERSE.');
  showSubtitle = signal(false);
  isCursorBlinking = signal(true);
  showStoreModal = signal(false);
  modalData = signal({ title: '', message: '', url: '' });

  // CTA Typewriter Signals
  ctaFullPrefix = signal('');
  ctaTypewriterPrefix = signal('');
  ctaTypewriterWord = signal('');
  ctaLongestWord = signal('YOUR DESTINY.');
  isCtaCursorBlinking = signal(true);
  
  mirrorTitleWords = computed(() => {
    return this.ts.t('mirror_title').split(' ');
  });

  @ViewChildren('starElement') starElements!: QueryList<ElementRef>;
  @ViewChild('spotlight') spotlight!: ElementRef;

  stars = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 0.4 + 0.1,
    delay: Math.random() * 6 + 's'
  }));

  mouseX = 0;
  mouseY = 0;
  private mouseMoveListener: any;
  private rafId: number | null = null;

  onMouseMove(event: MouseEvent) {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      
      if (this.spotlight) {
        this.spotlight.nativeElement.style.transform = `translate(calc(-50% + ${this.mouseX}px), calc(-50% + ${this.mouseY}px))`;
      }

      if (this.starElements) {
        const elements = this.starElements.toArray();
        const radius = 200; 
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        for (let i = 0; i < this.stars.length; i++) {
          const star = this.stars[i];
          const el = elements[i].nativeElement;
          
          const starX = (star.x * winW) / 100;
          const starY = (star.y * winH) / 100;
          
          const dx = starX - this.mouseX;
          const dy = starY - this.mouseY;
          const distanceSq = dx * dx + dy * dy;
          
          if (distanceSq < radius * radius) {
            const distance = Math.sqrt(distanceSq);
            const force = (radius - distance) / radius;
            const strength = 80;
            const offsetX = (dx / distance) * force * strength;
            const offsetY = (dy / distance) * force * strength;
            el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${star.size})`;
          } else {
            // Only reset if it was transformed before (using a data attribute or simple check)
            if (el.style.transform !== `scale(${star.size})`) {
              el.style.transform = `scale(${star.size})`;
            }
          }
        }
      }
      this.rafId = null;
    });
  }

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

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  async ngOnInit() {
    
    // Native high-performance mouse tracking outside Angular
    this.ngZone.runOutsideAngular(() => {
      this.mouseMoveListener = this.onMouseMove.bind(this);
      window.addEventListener('mousemove', this.mouseMoveListener, { passive: true });
    });
    
    // 1. Fetch and activate Remote Config
    try {
      await this.remoteConfigService.fetchAndActivate();
      
      // 2. Sync domain services (Always sync after fetch attempt)
      await Promise.all([
        this.genreConfigService.syncGenreConfigs(),
        this.avatarService.syncAvatars()
      ]);
    } catch (err) {
      console.error('Error syncing Sagas domain services:', err);
    }

    this.startIconCycle();
    this.startTypewriter();
    this.startCtaTypewriter();
    this.checkAdminAccess();
  }

  async checkAdminAccess() {
    const isAuthorized = await this.soulKeyService.validateHandshake();
    this.canAccessAdmin.set(isAuthorized);
  }

  goToAdmin() {
    if (this.canAccessAdmin()) {
      this.router.navigate(['/admin']);
    }
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onStoreRedirect() {
    const ua = navigator.userAgent.toLowerCase();
    const isMacOrIos = /macintosh|macintel|mac os x|iphone|ipad|ipod/.test(ua);
    
    // Get store links from Remote Config
    const storeLinks = this.remoteConfigService.getJson<any>('store_links') || {
      android: 'https://play.google.com/store/apps/details?id=com.ilustris.sagai',
      ios: ''
    };

    if (isMacOrIos) {
      if (storeLinks.ios) {
        this.modalData.set({
          title: 'App Store',
          message: this.ts.t('download_now'),
          url: storeLinks.ios
        });
      } else {
        this.modalData.set({
          title: 'App Store',
          message: this.ts.t('ios_coming_soon'),
          url: ''
        });
      }
    } else {
      if (storeLinks.android) {
        this.modalData.set({
          title: 'Play Store',
          message: this.ts.t('download_now'),
          url: storeLinks.android
        });
      } else {
        this.modalData.set({
          title: 'Play Store',
          message: this.ts.t('android_coming_soon'),
          url: ''
        });
      }
    }
    
    this.showStoreModal.set(true);
  }

  openUrl(url: string) {
    window.open(url, '_blank');
    this.showStoreModal.set(false);
  }

  async startTypewriter() {
    const prefix = this.ts.t('type_prefix');
    const prefixStr = prefix === 'type_prefix' ? 'CRAFT YOUR ' : prefix;
    this.fullPrefix.set(prefixStr);
    
    const words = [
      this.ts.t('type_journey') === 'type_journey' ? 'JOURNEY' : this.ts.t('type_journey'),
      this.ts.t('type_soul') === 'type_soul' ? 'SOUL' : this.ts.t('type_soul'),
      this.ts.t('type_universe') === 'type_universe' ? 'UNIVERSE.' : this.ts.t('type_universe')
    ];

    const longest = words.reduce((a, b) => a.length > b.length ? a : b, '');
    this.longestWord.set(longest);

    await this.delay(500); // Initial pause

    // 1. Type the prefix first
    this.isCursorBlinking.set(false);
    for (let i = 0; i <= prefixStr.length; i++) {
      this.typewriterPrefix.set(prefixStr.substring(0, i));
      await this.delay(60); // Prefix typing speed
    }
    
    // 2. Loop through the words
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      this.isCursorBlinking.set(false);
      
      // Type word
      for (let j = 0; j <= word.length; j++) {
        this.typewriterWord.set(word.substring(0, j));
        await this.delay(80); // Typing speed
      }
      
      this.isCursorBlinking.set(true);
      
      if (i === words.length - 1) {
        setTimeout(() => this.showSubtitle.set(true), 500);
        break; // Stop at last word
      }
      
      await this.delay(1500); // Pause before deleting
      
      // Delete word
      this.isCursorBlinking.set(false);
      for (let j = word.length; j >= 0; j--) {
        this.typewriterWord.set(word.substring(0, j));
        await this.delay(40); // Deleting speed
      }
    }
  }

  async startCtaTypewriter() {
    const prefix = this.ts.t('cta_type_prefix');
    const prefixStr = prefix === 'cta_type_prefix' ? 'BEGIN ' : prefix;
    this.ctaFullPrefix.set(prefixStr);
    
    const words = [
      this.ts.t('cta_type_word1') === 'cta_type_word1' ? 'YOUR SAGA' : this.ts.t('cta_type_word1'),
      this.ts.t('cta_type_word2') === 'cta_type_word2' ? 'YOUR LEGACY' : this.ts.t('cta_type_word2'),
      this.ts.t('cta_type_word3') === 'cta_type_word3' ? 'YOUR DESTINY.' : this.ts.t('cta_type_word3')
    ];

    const longest = words.reduce((a, b) => a.length > b.length ? a : b, '');
    this.ctaLongestWord.set(longest);

    await this.delay(500);

    // 1. Type the prefix first
    this.isCtaCursorBlinking.set(false);
    for (let i = 0; i <= prefixStr.length; i++) {
      this.ctaTypewriterPrefix.set(prefixStr.substring(0, i));
      await this.delay(60);
    }
    
    // 2. Loop through the words infinitely
    let wordIndex = 0;
    while (true) {
      const word = words[wordIndex % words.length];
      this.isCtaCursorBlinking.set(false);
      
      // Type word
      for (let j = 0; j <= word.length; j++) {
        this.ctaTypewriterWord.set(word.substring(0, j));
        await this.delay(80);
      }
      
      this.isCtaCursorBlinking.set(true);
      await this.delay(1800); // Pause to read
      
      // Delete word
      this.isCtaCursorBlinking.set(false);
      for (let j = word.length; j >= 0; j--) {
        this.ctaTypewriterWord.set(word.substring(0, j));
        await this.delay(40);
      }
      wordIndex++;
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnDestroy() { 
    if (this.cycleInterval) clearInterval(this.cycleInterval); 
    if (this.mouseMoveListener) window.removeEventListener('mousemove', this.mouseMoveListener);
  }

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
    const options = { threshold: 0.5 };
    this.ngZone.runOutsideAngular(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.ngZone.run(() => {
              const id = entry.target.id;
              this.activeSection.set(id);

              if (entry.target === this.diversitySection?.nativeElement) {
                this.diversityRevealed.set(true);
              } else if (entry.target === this.deepnessSection?.nativeElement) {
                this.deepnessRevealed.set(true);
              } else if (entry.target === this.mirrorSection?.nativeElement) {
                this.mirrorRevealed.set(true);
              } else if (entry.target === this.ctaSection?.nativeElement) {
                this.ctaRevealed.set(true);
              }
            });
          }
        });
      }, options);

      [
        this.heroSection, 
        this.diversitySection, 
        this.deepnessSection, 
        this.mirrorSection, 
        this.ctaSection
      ].forEach(el => { 
        if (el && el.nativeElement) {
          observer.observe(el.nativeElement); 
        }
      });
    });
  }
}
