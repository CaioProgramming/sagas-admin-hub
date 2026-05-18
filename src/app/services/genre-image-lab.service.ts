import { Injectable, inject } from '@angular/core';
import { GenreBundle } from './genre-config.service';
import { ImageTestType } from './gemini.service';
import {
  ImagenClientService,
  ImagenPromptStreamEvent,
  ImagenPromptTestResult,
} from './imagen-client.service';

export type { ImagenPromptTestResult, ImagenPromptStreamEvent };

@Injectable({ providedIn: 'root' })
export class GenreImageLabService {
  private imagen = inject(ImagenClientService);

  runGenrePromptTest(
    bundle: GenreBundle,
    imageType: ImageTestType,
    onEvent?: (event: ImagenPromptStreamEvent) => void
  ): Promise<ImagenPromptTestResult> {
    return this.imagen.runIntegratedPromptTest(bundle, imageType, onEvent);
  }
}
