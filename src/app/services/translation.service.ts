import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'pt-br';

interface TranslationMap {
  [key: string]: {
    [lang in Language]: string | string[];
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
    'nav_craft': { en: 'CRAFT', 'pt-br': 'CRIE' },
    'nav_genres': { en: 'GENRES', 'pt-br': 'GÊNEROS' },
    'nav_soul': { en: 'SOUL', 'pt-br': 'ALMA' },
    'nav_mirror': { en: 'MIRROR', 'pt-br': 'ESPELHO' },
    'nav_begin': { en: 'BEGIN', 'pt-br': 'COMECE' },
    'explore_universe': { en: 'EXPLORE UNIVERSE', 'pt-br': 'EXPLORE O UNIVERSO' },
    
    // Hero Section
    'hero_title': { en: 'EVERY STORY HAS A SOUL.', 'pt-br': 'TODA HISTÓRIA TEM UMA ALMA.' },
    'hero_subtitle': { 
      en: 'A living universe that breathes with your choices. Step into an existence where characters truly remember you, and your presence rewrites the fabric of reality itself.', 
      'pt-br': 'Um universo vivo que respira com as suas escolhas. Entre em uma existência onde personagens realmente se lembram de você, e sua presença reescreve a própria malha da realidade.' 
    },
    'hero_btn': { en: 'Start your story', 'pt-br': 'Comece sua história' },
    'ios_coming_soon': { en: 'Sagas is coming soon to the App Store!', 'pt-br': 'Sagas estará disponível na App Store em breve!' },

    // Typewriter
    'type_prefix': { en: 'CRAFT ', 'pt-br': 'CRIE ' },
    'type_journey': { en: 'YOUR JOURNEY', 'pt-br': 'SUA JORNADA' },
    'type_soul': { en: 'YOUR SOUL', 'pt-br': 'SUA ALMA' },
    'type_universe': { en: 'YOUR UNIVERSE.', 'pt-br': 'SEU UNIVERSO.' },

    // CTA Typewriter
    'cta_type_prefix': { en: 'BEGIN ', 'pt-br': 'COMECE ' },
    'cta_type_word1': { en: 'YOUR SAGA', 'pt-br': 'SUA SAGA' },
    'cta_type_word2': { en: 'YOUR LEGACY', 'pt-br': 'SEU LEGADO' },
    'cta_type_word3': { en: 'YOUR DESTINY.', 'pt-br': 'SEU DESTINO.' },

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
    'mirror_desc': { en: 'It is not about becoming a hero or a villain. It is about witnessing the emotional reflection of your choices and discovering your true self in the echoes of the story.', 'pt-br': 'Não se trata de se tornar um herói ou um vilão. Trata-se de testemunhar o reflexo emocional de suas escolhas e descobrir seu verdadeiro eu nos ecos da história.' },

    // Emotional Tones (Soul Mirror)
    'tone_neutral': { en: 'NEUTRAL', 'pt-br': 'NEUTRO' },
    'synonyms_neutral': { en: ['BALANCED', 'GROUNDED', 'CENTERED', 'OBSERVING'], 'pt-br': ['EQUILIBRADO', 'CENTRADO', 'CONECTADO', 'OBSERVADOR'] },
    'tone_calm': { en: 'CALM', 'pt-br': 'CALMO' },
    'synonyms_calm': { en: ['TRANQUIL', 'PEACEFUL', 'SERENE', 'STILL'], 'pt-br': ['TRANQUILO', 'PACÍFICO', 'SERENO', 'QUIETO'] },
    'tone_curious': { en: 'CURIOUS', 'pt-br': 'CURIOSO' },
    'synonyms_curious': { en: ['INQUISITIVE', 'WONDERING', 'SEARCHING', 'INTRIGUED'], 'pt-br': ['INQUISITIVO', 'PENSATIVO', 'INVESTIGATIVO', 'INTRIGADO'] },
    'tone_hopeful': { en: 'HOPEFUL', 'pt-br': 'ESPERANÇOSO' },
    'synonyms_hopeful': { en: ['OPTIMISTIC', 'ASPIRING', 'BUOYANT', 'BRIGHT'], 'pt-br': ['OTIMISTA', 'INSPIRADO', 'ANIMADO', 'RADIANTE'] },
    'tone_determined': { en: 'DETERMINED', 'pt-br': 'DETERMINADO' },
    'synonyms_determined': { en: ['RESOLUTE', 'DRIVEN', 'STEADFAST', 'UNYIELDING'], 'pt-br': ['RESOLUTO', 'MOTIVADO', 'FIRME', 'INABALÁVEL'] },
    'tone_empathetic': { en: 'EMPATHETIC', 'pt-br': 'EMPÁTICO' },
    'synonyms_empathetic': { en: ['COMPASSIONATE', 'WARM', 'UNDERSTANDING', 'RESONANT'], 'pt-br': ['COMPASSIVO', 'CALOROSO', 'COMPREENSIVO', 'RESSONANTE'] },
    'tone_joyful': { en: 'JOYFUL', 'pt-br': 'ALEGRE' },
    'synonyms_joyful': { en: ['RADIANT', 'VIBRANT', 'ELATED', 'LUMINOUS'], 'pt-br': ['RADIANTE', 'VIBRANTE', 'EUFÓRICO', 'LUMINOSO'] },
    'tone_concerned': { en: 'CONCERNED', 'pt-br': 'PREOCUPADO' },
    'synonyms_concerned': { en: ['MINDFUL', 'CAUTIOUS', 'GUARDED', 'ATTENTIVE'], 'pt-br': ['ATENTO', 'CAUTELOSO', 'DEFENSIVO', 'VIGILANTE'] },
    'tone_anxious': { en: 'ANXIOUS', 'pt-br': 'ANSIOSO' },
    'synonyms_anxious': { en: ['RESTLESS', 'TENSE', 'UNSETTLED', 'TREMBLING'], 'pt-br': ['INQUIETO', 'TENSO', 'PERTURBADO', 'TRÊMULO'] },
    'tone_frustrated': { en: 'FRUSTRATED', 'pt-br': 'FRUSTRADO' },
    'synonyms_frustrated': { en: ['VEXED', 'CONFINED', 'AGITATED', 'STIFLED'], 'pt-br': ['IRRITADO', 'CONFINADO', 'AGITADO', 'SUFOCADO'] },
    'tone_angry': { en: 'ANGRY', 'pt-br': 'RAIVOSO' },
    'synonyms_angry': { en: ['FURIOUS', 'INCENSED', 'WRATHFUL', 'FIERCE'], 'pt-br': ['FURIOSO', 'INDIGNADO', 'IRADO', 'FEROZ'] },
    'tone_sad': { en: 'SAD', 'pt-br': 'TRISTE' },
    'synonyms_sad': { en: ['SORROWFUL', 'GRIEVING', 'HEAVY', 'MOURNFUL'], 'pt-br': ['LAMURIOSO', 'LUTUOSO', 'PESADO', 'CHOROSO'] },
    'tone_melancholic': { en: 'MELANCHOLIC', 'pt-br': 'MELANCÓLICO' },
    'synonyms_melancholic': { en: ['PENSIVE', 'WISTFUL', 'SOMBER', 'DRIFTING'], 'pt-br': ['PENSATIVO', 'SAUDOSO', 'SOMBRIO', 'DISTANTE'] },
    'tone_cynical': { en: 'CYNICAL', 'pt-br': 'CÍNICO' },
    'synonyms_cynical': { en: ['JADED', 'SKEPTICAL', 'DETACHED', 'COLD'], 'pt-br': ['FADIGADO', 'CÉTICO', 'DESAPEGADO', 'FRIO'] },

    // Genre Descriptions (Soul focused, avoiding visual descriptions)
    'genre_title_default': { en: 'Uncharted', 'pt-br': 'Inexplorado' },
    'genre_desc_default': {
      en: 'An uncharted state of existence. The rules of this reality are fluid, offering a raw canvas where profound choices and unseen consequences are waiting to be realized.',
      'pt-br': 'Um estado inexplorado de existência. As regras desta realidade são fluidas, oferecendo uma tela crua onde escolhas profundas e consequências invisíveis aguardam para ser realizadas.'
    },
    'genre_title_fantasy': { en: 'Fantasy', 'pt-br': 'Fantasia' },
    'genre_desc_fantasy': { 
      en: 'A realm of absolute destiny and tragic burdens. Ancient forces clash, and the weight of history rests heavily on those who must choose between duty and their own humanity.', 
      'pt-br': 'Um reino de destino absoluto e fardos trágicos. Forças ancestrais colidem, e o peso da história repousa sobre aqueles que devem escolher entre o dever e sua própria humanidade.' 
    },
    'genre_title_cyberpunk': { en: 'Cyberpunk', 'pt-br': 'Cyberpunk' },
    'genre_desc_cyberpunk': { 
      en: 'A world of relentless ambition and manufactured souls. It explores the extreme limits of human desire, the sacrifice of identity for power, and the isolation found in an overcrowded existence.', 
      'pt-br': 'Um mundo de ambição implacável e almas fabricadas. Explora os limites extremos do desejo humano, o sacrifício da identidade pelo poder e o isolamento encontrado em uma existência superlotada.' 
    },
    'genre_title_space_opera': { en: 'Space Opera', 'pt-br': 'Space Opera' },
    'genre_desc_space_opera': { 
      en: 'A boundless theater of hope and grand discovery. It is driven by the indomitable spirit of exploration, the longing for connection across the void, and the belief in a brighter tomorrow.', 
      'pt-br': 'Um teatro sem limites de esperança e grandes descobertas. É movido pelo espírito indomável da exploração, o anseio por conexão através do vazio e a crença em um amanhã mais brilhante.' 
    },
    'genre_title_horror': { en: 'Horror', 'pt-br': 'Terror' },
    'genre_desc_horror': { 
      en: 'A descent into psychological fragility. It confronts the terrifying reality of our own vulnerabilities, the crushing weight of isolation, and the despair when sanity begins to fracture.', 
      'pt-br': 'Uma descida à fragilidade psicológica. Confronta a realidade aterrorizante de nossas próprias vulnerabilidades, o peso esmagador do isolamento e o desespero quando a sanidade começa a se fraturar.' 
    },
    'genre_title_crime': { en: 'Crime', 'pt-br': 'Crime' },
    'genre_desc_crime': { 
      en: 'An empire built on ambition and quiet dominance. It is a study of power, loyalty, and the moral compromises made when absolute authority corrupts from the inside out.', 
      'pt-br': 'Um império construído sobre a ambição e o domínio silencioso. É um estudo sobre o poder, a lealdade e os compromissos morais feitos quando a autoridade absoluta corrompe de dentro para fora.' 
    },
    'genre_title_shinobi': { en: 'Shinobi', 'pt-br': 'Shinobi' },
    'genre_desc_shinobi': { 
      en: 'A minimalist philosophy of discipline and violent peace. It is about the absolute zen of existence, where every action holds life-or-death consequence and silence speaks louder than words.', 
      'pt-br': 'Uma filosofia minimalista de disciplina e paz violenta. É sobre o zen absoluto da existência, onde cada ação tem consequências de vida ou morte e o silêncio fala mais alto que palavras.' 
    },
    'genre_title_cowboy': { en: 'Western', 'pt-br': 'Faroeste' },
    'genre_desc_cowboy': { 
      en: 'A journey of stoic resilience and rugged individualism. It reflects the lonely pursuit of justice, the quiet endurance against harsh realities, and a personal code that cannot be broken.', 
      'pt-br': 'Uma jornada de resiliência estoica e individualismo rústico. Reflete a busca solitária pela justiça, a resistência silenciosa contra realidades duras e um código pessoal inquebrável.' 
    },
    'genre_title_punk_rock': { en: 'Punk Rock', 'pt-br': 'Punk Rock' },
    'genre_desc_punk_rock': { 
      en: 'A chaotic rejection of conformity. It pulsates with anarchic energy, rebellious truth, and the raw desire to scream against a system designed to keep the spirit imprisoned.', 
      'pt-br': 'Uma rejeição caótica à conformidade. Pulsa com energia anárquica, verdade rebelde e o desejo cru de gritar contra um sistema projetado para manter o espírito aprisionado.' 
    },
    'genre_title_heroes': { en: 'Heroes', 'pt-br': 'Heróis' },
    'genre_desc_heroes': { 
      en: 'A narrative of immense burden and moral conviction. It is about the heavy cost of protecting others, the constant fight against inner demons, and the choice to remain a savior when it hurts the most.', 
      'pt-br': 'Uma narrativa de fardo imenso e convicção moral. É sobre o alto custo de proteger os outros, a luta constante contra os demônios interiores e a escolha de permanecer um salvador quando mais dói.' 
    }
  };

  t(key: string): string {
    const entry = this.strings[key];
    if (!entry) return key;
    return entry[this.currentLang()] as string;
  }

  tList(key: string): string[] {
    const entry = this.strings[key];
    if (!entry) return [];
    return entry[this.currentLang()] as string[];
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }
}
