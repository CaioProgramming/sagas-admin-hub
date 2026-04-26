import { Component, ElementRef, ViewChild, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import JSZip from 'jszip';

interface SpriteCell {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  adjX: number;
  adjY: number;
  adjW: number;
  adjH: number;
}

@Component({
  selector: 'app-sprite-cutter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cutter-layout">
      <!-- Sidebar -->
      <aside class="tool-sidebar glass-card">
        <div class="section">
          <h3>Grid Config</h3>
          <div class="grid-inputs">
            <div class="input-group">
              <label>Cols</label>
              <input type="number" [(ngModel)]="cols" (change)="updateGrid()">
            </div>
            <div class="input-group">
              <label>Rows</label>
              <input type="number" [(ngModel)]="rows" (change)="updateGrid()">
            </div>
          </div>
          <div class="grid-inputs">
            <div class="input-group">
              <label>X Off</label>
              <input type="number" [(ngModel)]="offsetX" (change)="updateGrid()">
            </div>
            <div class="input-group">
              <label>Y Off</label>
              <input type="number" [(ngModel)]="offsetY" (change)="updateGrid()">
            </div>
          </div>
          <div class="range-group">
            <label>Cell Scale: {{cellScale()}}</label>
            <input type="range" min="0.5" max="1.0" step="0.01" [ngModel]="cellScale()" (input)="onScaleChange($event)">
          </div>
        </div>

        <div class="section">
          <h3>Naming Preset</h3>
          <select [(ngModel)]="preset" (change)="applyPreset()">
            <option value="emotional_tone">EmotionalTone (Sagas)</option>
            <option value="numbered">Numbered</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div class="section cell-list-container">
          <h3>Cells ({{cells().length}})</h3>
          <div class="cell-list">
            <div class="cell-item" *ngFor="let cell of cells(); let i = index">
              <span class="idx">{{i}}</span>
              <input type="text" [(ngModel)]="cell.name" placeholder="Name...">
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-full" (click)="exportAll()" [disabled]="!imageLoaded()">
          Export All (.ZIP)
        </button>
      </aside>

      <!-- Main Area -->
      <main class="canvas-area">
        <div class="drop-zone" *ngIf="!imageLoaded()" (click)="fileInput.click()">
          <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
          <span class="icon">🐉</span>
          <p>Drop your sprite sheet here</p>
        </div>

        <div class="canvas-container" [class.visible]="imageLoaded()">
          <canvas #mainCanvas></canvas>
          <div class="grid-overlay" #gridOverlay>
            <div class="grid-cell" *ngFor="let cell of cells()" 
                 [style.left.px]="cell.x + cell.adjX" 
                 [style.top.px]="cell.y + cell.adjY"
                 [style.width.px]="cell.w + cell.adjW"
                 [style.height.px]="cell.h + cell.adjH">
              <span class="cell-label">{{cell.name || '?'}}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .cutter-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2rem;
      height: calc(100vh - 120px);
    }

    .tool-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      overflow-y: auto;
    }

    .section h3 {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      letter-spacing: 0.05em;
    }

    .grid-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .input-group label {
      font-size: 0.7rem;
      color: var(--text-secondary);
      display: block;
      margin-bottom: 0.25rem;
    }

    input[type="number"], input[type="text"], select {
      width: 100%;
      background: var(--surface-lowest);
      border: 1px solid var(--outline);
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .range-group label {
      font-size: 0.75rem;
      color: var(--primary-color);
      display: block;
      margin-bottom: 0.5rem;
    }

    .cell-list-container {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .cell-list {
      flex-grow: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      max-height: 300px;
      padding-right: 0.5rem;
    }

    .cell-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.03);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .cell-item .idx {
      font-size: 0.7rem;
      color: var(--text-secondary);
      min-width: 20px;
    }

    .canvas-area {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-low);
      border-radius: var(--radius-default);
      position: relative;
      overflow: auto;
    }

    .drop-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
    }

    .drop-zone .icon { font-size: 4rem; }

    .canvas-container {
      position: relative;
      display: none;
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
    }

    .canvas-container.visible { display: block; }

    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .grid-cell {
      position: absolute;
      border: 1px solid var(--sagas-red);
      background: rgba(139, 38, 53, 0.1);
      box-sizing: border-box;
    }

    .cell-label {
      position: absolute;
      top: 0;
      left: 0;
      background: var(--sagas-red);
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      font-weight: bold;
    }

    .btn-full { width: 100%; }

    /* Scrollbar */
    .cell-list::-webkit-scrollbar { width: 4px; }
    .cell-list::-webkit-scrollbar-thumb { background: var(--outline); border-radius: 2px; }
  `]
})
export class SpriteCutter {
  @ViewChild('mainCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected cols = 4;
  protected rows = 4;
  protected offsetX = 0;
  protected offsetY = 0;
  protected cellScale = signal(1.0);
  protected preset = 'emotional_tone';
  
  protected imageLoaded = signal(false);
  protected cells = signal<SpriteCell[]>([]);
  
  private img: HTMLImageElement | null = null;
  private emotionalTones = [
    'Curiosity', 'Courage', 'Peace', 'Sorrow', 'Anger', 
    'Awe', 'Confusion', 'Determination', 'Fear', 'Joy', 
    'Melancholy', 'Relief', 'Surprise', 'Tension'
  ];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.img = new Image();
      this.img.onload = () => {
        this.imageLoaded.set(true);
        this.renderCanvas();
        this.updateGrid();
      };
      this.img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onScaleChange(e: any) {
    this.cellScale.set(parseFloat(e.target.value));
    this.updateGrid();
  }

  renderCanvas() {
    if (!this.img) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.img.width;
    canvas.height = this.img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(this.img, 0, 0);
  }

  updateGrid() {
    if (!this.img) return;
    const cellW = this.img.width / this.cols;
    const cellH = this.img.height / this.rows;
    const scale = this.cellScale();

    const newCells: SpriteCell[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * cellW + this.offsetX;
        const y = r * cellH + this.offsetY;
        const w = cellW * scale;
        const h = cellH * scale;

        newCells.push({
          name: '',
          x, y, w, h,
          adjX: 0, adjY: 0, adjW: 0, adjH: 0
        });
      }
    }
    this.cells.set(newCells);
    this.applyPreset();
  }

  applyPreset() {
    const currentCells = this.cells();
    currentCells.forEach((cell, i) => {
      if (this.preset === 'emotional_tone') {
        cell.name = this.emotionalTones[i] || `cell_${i}`;
      } else if (this.preset === 'numbered') {
        cell.name = `cell_${i}`;
      }
    });
  }

  async exportAll() {
    if (!this.img) return;
    const zip = new JSZip();
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');

    const promises = this.cells().map(async (cell) => {
      tempCanvas.width = cell.w;
      tempCanvas.height = cell.h;
      ctx?.clearRect(0, 0, cell.w, cell.h);
      ctx?.drawImage(
        this.img!,
        cell.x, cell.y, cell.w, cell.h,
        0, 0, cell.w, cell.h
      );

      return new Promise<void>((resolve) => {
        tempCanvas.toBlob((blob) => {
          if (blob) zip.file(`${cell.name || 'sprite'}.png`, blob);
          resolve();
        });
      });
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "sagas_sprites.zip";
    link.click();
  }
}
