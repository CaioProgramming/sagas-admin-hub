import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import JSZip from 'jszip';

@Component({
  selector: 'app-silhouette-studio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="studio-container">
      <header class="page-header">
        <h1>Silhouette Studio ⚡️</h1>
        <p>Convert AI silhouettes to transparent production assets</p>
      </header>

      <div class="drop-zone" 
           (click)="fileInput.click()" 
           (dragover)="$event.preventDefault(); dragOver = true" 
           (dragleave)="dragOver = false" 
           (drop)="onDrop($event)"
           [class.drag-over]="dragOver">
        <input type="file" #fileInput (change)="onFileSelected($event)" multiple accept="image/*" style="display: none">
        <span class="icon">🖼️</span>
        <span>Drop your silhouettes here (Batch Processing)</span>
      </div>

      <div class="gallery">
        <div class="card glass-card" *ngFor="let file of originalFiles(); let i = index">
          <div class="card-preview">
            <canvas #canvasElement></canvas>
          </div>
          <div class="card-info">{{file.name}}</div>
          <button class="btn btn-secondary" (click)="downloadSingle(i)">Download PNG</button>
        </div>
      </div>

      <div class="controls-bar glass-card" *ngIf="originalFiles().length > 0">
        <div class="control-item">
          <label>White Tolerance</label>
          <input type="range" min="0" max="150" [value]="tolerance()" (input)="updateTolerance($event)">
          <span class="val">{{tolerance()}}</span>
        </div>
        <div class="control-item">
          <label>Contrast</label>
          <input type="range" min="0" max="100" [value]="contrast()" (input)="updateContrast($event)">
          <span class="val">{{contrast()}}%</span>
        </div>
        <div class="divider"></div>
        <div class="control-item">
          <label>Zoom</label>
          <input type="range" min="100" max="400" [value]="zoom()" (input)="updateZoom($event)">
          <span class="val">{{zoom()}}%</span>
        </div>
        <div class="control-item">
          <label>Y-Offset</label>
          <input type="range" min="-100" max="100" [value]="yOffset()" (input)="updateYOffset($event)">
          <span class="val">{{yOffset()}}</span>
        </div>
        <button class="btn btn-primary" (click)="downloadAll()">Download All (.ZIP)</button>
      </div>
    </div>
  `,
  styles: [`
    .studio-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
    }

    .drop-zone {
      width: 100%;
      height: 180px;
      border: 2px dashed var(--outline);
      border-radius: var(--radius-default);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--surface-low);
      cursor: pointer;
      transition: all 0.3s;
      gap: 1rem;
    }

    .drop-zone.drag-over {
      border-color: var(--sagas-red);
      background: rgba(139, 38, 53, 0.05);
    }

    .drop-zone .icon {
      font-size: 3rem;
      opacity: 0.5;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
      padding-bottom: 100px;
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card-preview {
      width: 100%;
      aspect-ratio: 1;
      background-image: 
        linear-gradient(45deg, #1a1a1c 25%, transparent 25%), 
        linear-gradient(-45deg, #1a1a1c 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #1a1a1c 75%), 
        linear-gradient(-45deg, transparent 75%, #1a1a1c 75%);
      background-size: 20px 20px;
      background-color: #111;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    canvas {
      max-width: 100%;
      max-height: 100%;
    }

    .card-info {
      font-size: 0.85rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .controls-bar {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1rem 2rem;
      border-radius: 50px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      z-index: 1000;
      background: rgba(20, 20, 25, 0.9);
      border: 1px solid var(--sagas-red);
    }

    .control-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .control-item label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .control-item .val {
      font-size: 0.7rem;
      color: var(--primary-color);
      font-weight: bold;
    }

    .divider {
      width: 1px;
      height: 40px;
      background: var(--outline);
    }

    input[type="range"] {
      width: 100px;
      accent-color: var(--sagas-red);
    }
  `]
})
export class SilhouetteStudio {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('canvasElement') canvases!: ElementRef<HTMLCanvasElement>[];

  protected readonly originalFiles = signal<File[]>([]);
  protected cachedImages: HTMLImageElement[] = [];
  protected dragOver = false;

  protected readonly tolerance = signal(30);
  protected readonly contrast = signal(80);
  protected readonly zoom = signal(100);
  protected readonly yOffset = signal(0);

  onFileSelected(event: any) {
    this.handleFiles(event.target.files);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  async handleFiles(files: FileList) {
    const fileList = Array.from(files);
    this.originalFiles.set(fileList);
    this.cachedImages = [];
    
    // Allow time for DOM to update with new cards
    setTimeout(async () => {
      const canvasElements = document.querySelectorAll('canvas');
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const dataUrl = await this.readFile(file);
        const img = await this.loadImage(dataUrl);
        this.cachedImages.push(img);
        this.processImage(img, canvasElements[i], i);
      }
    }, 0);
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  }

  updateTolerance(e: any) {
    this.tolerance.set(parseInt(e.target.value));
    this.updateAll();
  }

  updateContrast(e: any) {
    this.contrast.set(parseInt(e.target.value));
    this.updateAll();
  }

  updateZoom(e: any) {
    this.zoom.set(parseInt(e.target.value));
    this.updateAll();
  }

  updateYOffset(e: any) {
    this.yOffset.set(parseInt(e.target.value));
    this.updateAll();
  }

  updateAll() {
    const canvasElements = document.querySelectorAll('canvas');
    this.cachedImages.forEach((img, i) => {
      if (canvasElements[i]) this.processImage(img, canvasElements[i], i);
    });
  }

  processImage(img: HTMLImageElement, canvas: HTMLCanvasElement, index: number) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const SIZE = 1024;
    canvas.width = SIZE;
    canvas.height = SIZE;
    
    const zoom = this.zoom() / 100;
    const yOffPercent = (this.yOffset() / 100);
    const contrast = this.contrast() / 100;
    
    const baseSize = Math.min(img.width, img.height);
    const sourceSize = baseSize / zoom;
    
    const centerX = img.width / 2;
    const centerY = img.height / 2;
    
    const maxSlack = (img.height - sourceSize) / 2;
    const appliedYOff = yOffPercent * maxSlack;

    const sourceX = centerX - (sourceSize / 2);
    const sourceY = (centerY - (sourceSize / 2)) + appliedYOff;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(
      img, 
      Math.max(0, sourceX), 
      Math.max(0, sourceY), 
      Math.min(sourceSize, img.width - sourceX), 
      Math.min(sourceSize, img.height - sourceY), 
      0, 0, SIZE, SIZE
    );

    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;
    const tol = this.tolerance();

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]; const g = data[i+1]; const b = data[i+2];
      const avg = (r + g + b) / 3;
      const minWhite = 255 - tol;
      
      if (avg > minWhite) {
        const alphaRatio = (255 - avg) / (Math.max(1, 255 - minWhite));
        data[i + 3] = Math.max(0, Math.min(255, alphaRatio * 255));
      } else {
        const darkenFactor = 1 - contrast;
        data[i] = data[i] * darkenFactor;
        data[i+1] = data[i+1] * darkenFactor;
        data[i+2] = data[i+2] * darkenFactor;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  downloadSingle(index: number) {
    const canvas = document.querySelectorAll('canvas')[index];
    if (!canvas) return;
    const link = document.createElement('a');
    const baseName = this.originalFiles()[index].name.replace(/\.[^/.]+$/, "");
    link.download = `sagas_${baseName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async downloadAll() {
    const zip = new JSZip();
    const canvasElements = document.querySelectorAll('canvas');
    
    const promises = Array.from(canvasElements).map((canvas, i) => {
      return new Promise<void>((resolve) => {
        const fileName = this.originalFiles()[i].name.replace(/\.[^/.]+$/, "");
        canvas.toBlob((blob) => {
          if (blob) zip.file(`sagas_${fileName}.png`, blob);
          resolve();
        }, 'image/png');
      });
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "sagas_silhouettes_pack.zip";
    link.click();
  }
}
