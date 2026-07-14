"use client";

import { Camera, CheckCircle2, Eye, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { averageDescriptors } from "@/lib/face";

type FaceApi = typeof import("@vladmandic/face-api");
type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function eyeAspectRatio(points: Point[]) {
  if (points.length < 6) return 1;
  return (distance(points[1], points[5]) + distance(points[2], points[4])) / (2 * distance(points[0], points[3]));
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function FaceCapture({ samples = 1, onDescriptor }: { samples?: number; onDescriptor: (descriptor: number[] | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const apiRef = useRef<FaceApi | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [captured, setCaptured] = useState<number[][]>([]);
  const [status, setStatus] = useState("Cargando modelos de reconocimiento facial...");
  const [tone, setTone] = useState<"neutral" | "success" | "error">("neutral");

  const start = useCallback(async () => {
    try {
      setStatus("Cargando modelos de reconocimiento facial...");
      const faceapi = await import("@vladmandic/face-api");
      apiRef.current = faceapi;
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
      setStatus("Cámara lista. Mantén un solo rostro visible y pulsa verificar.");
    } catch (error) {
      console.error(error);
      setTone("error");
      setStatus("No se pudo iniciar la cámara o cargar los modelos. Revisa el permiso y usa HTTPS.");
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void start(), 0);
    return () => {
      window.clearTimeout(task);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [start]);

  async function capture() {
    const faceapi = apiRef.current;
    const video = videoRef.current;
    if (!faceapi || !video || !ready || processing) return;
    setProcessing(true);
    setTone("neutral");
    setStatus("Mira al frente y parpadea de forma natural...");
    let baseline = 0;
    let blinkClosed = false;
    let lastDescriptor: number[] | null = null;

    try {
      for (let attempt = 0; attempt < 65; attempt += 1) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.55 }))
          .withFaceLandmarks(true)
          .withFaceDescriptors();

        if (detections.length !== 1) {
          setStatus(detections.length > 1 ? "Solo debe aparecer una persona en la cámara." : "No se detecta un rostro claro. Mejora la iluminación.");
          await sleep(220);
          continue;
        }

        const landmarks = detections[0].landmarks;
        const left = eyeAspectRatio(landmarks.getLeftEye());
        const right = eyeAspectRatio(landmarks.getRightEye());
        const ear = (left + right) / 2;
        baseline = Math.max(baseline, ear);
        lastDescriptor = Array.from(detections[0].descriptor);

        if (!blinkClosed && baseline > 0.18 && ear < baseline * 0.72) {
          blinkClosed = true;
          setStatus("Parpadeo detectado. Abre los ojos y mantén la mirada al frente.");
        } else if (blinkClosed && ear > baseline * 0.84 && lastDescriptor) {
          const next = [...captured, lastDescriptor];
          setCaptured(next);
          if (next.length >= samples) {
            onDescriptor(averageDescriptors(next));
            setTone("success");
            setStatus(`Verificación completada con ${next.length} muestra${next.length === 1 ? "" : "s"}.`);
          } else {
            setTone("success");
            setStatus(`Muestra ${next.length} de ${samples} capturada. Repite la verificación.`);
          }
          return;
        }
        await sleep(220);
      }
      setTone("error");
      setStatus("No se confirmó el parpadeo a tiempo. Intenta nuevamente con mejor iluminación.");
    } catch (error) {
      console.error(error);
      setTone("error");
      setStatus("No se pudo procesar el rostro. Intenta nuevamente.");
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    setCaptured([]);
    onDescriptor(null);
    setTone("neutral");
    setStatus("Capturas reiniciadas. Mantén un solo rostro visible.");
  }

  const complete = captured.length >= samples;
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
        <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full scale-x-[-1] object-cover" aria-label="Vista previa de la cámara" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-[70%] w-[52%] rounded-[50%] border-2 border-dashed border-emerald-300/90 shadow-[0_0_0_999px_rgba(2,6,23,0.30)]" />
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {ready ? "Cámara activa" : "Preparando"}
        </div>
      </div>
      <div className={`rounded-xl p-3 text-sm ${tone === "success" ? "bg-emerald-50 text-emerald-800" : tone === "error" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"}`} aria-live="polite">
        <div className="flex gap-2">
          {processing ? <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin" /> : tone === "success" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <Eye className="mt-0.5 size-4 shrink-0" />}
          <span>{status}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={capture} disabled={!ready || processing || complete} className="btn btn-primary focus-ring flex-1">
          {processing ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {samples > 1 ? `Verificar muestra ${Math.min(captured.length + 1, samples)}/${samples}` : "Verificar rostro"}
        </button>
        {captured.length > 0 && <button type="button" onClick={reset} className="btn btn-secondary focus-ring"><RefreshCw className="size-4" />Reiniciar</button>}
      </div>
      <p className="text-xs leading-5 text-slate-500">La imagen se procesa en este navegador y se descarta. Solo se envía el descriptor matemático después de validar el parpadeo.</p>
    </div>
  );
}
