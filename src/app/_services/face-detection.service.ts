// face-detection.service.ts
import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaceDetectionService {
  private model: any = null;

  constructor() {
    // Load the model when service is initialized
    this.loadModel();
  }

  private async loadModel() {
    if (!this.model) {
      this.model = await blazeface.load();
    }
    return this.model;
  }

  /**
   * Detects if the provided image contains a face
   * @param imageData Image data URL (from FileReader)
   * @returns Observable that resolves to true if face is detected, false otherwise
   */
  detectFace(imageData: string): Observable<boolean> {
    return from(this.processFaceDetection(imageData));
  }

  private async processFaceDetection(imageData: string): Promise<boolean> {
    // Make sure model is loaded
    const model = await this.loadModel();

    // Create an HTMLImageElement from the data URL
    const img = new Image();
    return new Promise<boolean>((resolve) => {
      img.onload = async () => {
        // Run the face detection
        const predictions = await model.estimateFaces(img, false);

        // If any faces were detected, return true
        resolve(predictions.length > 0);

        // Clean up to prevent memory leaks
        tf.dispose(predictions);
      };
      img.src = imageData;
    });
  }
}
