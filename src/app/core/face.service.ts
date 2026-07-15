import { Injectable } from '@angular/core';
import * as faceapi from '@vladmandic/face-api';
@Injectable({ providedIn: 'root' })
export class FaceService {
  private loaded=false;
  async load() { if(this.loaded) return; await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('/models'), faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'), faceapi.nets.faceRecognitionNet.loadFromUri('/models')]); this.loaded=true; }
  async descriptor(video: HTMLVideoElement): Promise<number[]> { await this.load(); const faces=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceDescriptors(); if(faces.length!==1) throw new Error(faces.length?'Debe haber exactamente un rostro visible.':'No se detectó un rostro.'); return Array.from(faces[0].descriptor); }
  average(samples:number[][]) { return samples[0].map((_,i)=>samples.reduce((s,a)=>s+a[i],0)/samples.length); }
}
