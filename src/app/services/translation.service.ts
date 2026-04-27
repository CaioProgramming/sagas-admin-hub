import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'pt-br';

interface TranslationMap {
  [key: string]: {
    [lang in Language]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('en');

  constructor() {
    this.detectLanguage();
  }

  private detectLanguage() {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) {
      this.currentLang.set('pt-br');
    } else {
      this.currentLang.set('en');
    }
  }

  private strings: TranslationMap = {
    // Navigation
    'nav_home': { en: 'Home', 'pt-br': 'Início' },
    'nav_universes': { en: 'Universes', 'pt-br': 'Universos' },
    
    // Hero Section
    'hero_title': { en: 'EVERY STORY HAS A SOUL.', 'pt-br': 'TODA HISTÓRIA TEM UMA ALMA.' },
    'hero_subtitle': { en: 'The most powerful AI storytelling engine ever built. Experience narratives that remember you.', 'pt-br': 'O motor de narrativa por IA mais poderoso já criado. Experiencie histórias que se lembram de você.' },
    'hero_btn': { en: 'Download Hub', 'pt-br': 'Baixar Hub' },

    // Diversity Section
    'diversity_tag': { en: 'DIVERSITY', 'pt-br': 'DIVERSIDADE' },
    'diversity_title': { en: 'INFINITE WORLDS.', 'pt-br': 'MUNDOS INFINITOS.' },
    'diversity_desc': { en: 'Boundless possibilities where your imagination is the only limit. Each universe possesses a unique soul, waiting to be shaped by your choices.', 'pt-br': 'Possibilidades ilimitadas onde sua imaginação é o único limite. Cada universo possui uma alma única, esperando para ser moldada por suas escolhas.' },

    // Deepness Section
    'deepness_tag': { en: 'DEEPNESS', 'pt-br': 'PROFUNDIDADE' },
    'deepness_title': { en: 'CHARACTERS WITH SOULS.', 'pt-br': 'PERSONAGENS COM ALMA.' },
    'deepness_persona': { en: 'THEY REMEMBER.', 'pt-br': 'ELES SE LEMBRAM.' },
    'deepness_desc': { en: 'Build relationships with characters who possess memory, trauma, and ambition.', 'pt-br': 'Construa relacionamentos com personagens que possuem memória, trauma e ambição.' },

    // Mirror Section (The Emotional Aspect)
    'mirror_tag': { en: 'THE MIRROR', 'pt-br': 'O ESPELHO' },
    'mirror_title': { en: 'SEE WHO YOU TRULY ARE.', 'pt-br': 'VEJA QUEM VOCÊ REALMENTE É.' },
    'mirror_desc': { en: 'It is not about becoming a hero or a villain. It is about witnessing the emotional reflection of your choices and discovering your true self in the echoes of the story.', 'pt-br': 'Não se trata de se tornar um herói ou um vilão. Trata-se de testemunhar o reflexo emocional de suas escolhas e descobrir seu verdadeiro eu nos ecos da história.' }
  };

  t(key: string): string {
    const entry = this.strings[key];
    if (!entry) return key;
    return entry[this.currentLang()];
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }
}
