export const DESCRIPTOR_LENGTH = 128;

export function validateDescriptor(value: unknown): value is number[] {
  return Array.isArray(value)
    && value.length === DESCRIPTOR_LENGTH
    && value.every((item) => typeof item === "number" && Number.isFinite(item) && Math.abs(item) <= 10);
}

export function euclideanDistance(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) throw new Error("Los descriptores no son comparables.");
  let total = 0;
  for (let index = 0; index < a.length; index += 1) {
    const delta = a[index] - b[index];
    total += delta * delta;
  }
  return Math.sqrt(total);
}

export function averageDescriptors(samples: number[][]) {
  if (samples.length === 0 || samples.some((sample) => !validateDescriptor(sample))) {
    throw new Error("Las muestras faciales son inválidas.");
  }
  return Array.from({ length: DESCRIPTOR_LENGTH }, (_, index) =>
    samples.reduce((sum, sample) => sum + sample[index], 0) / samples.length,
  );
}

export function matchThreshold() {
  const parsed = Number(process.env.FACE_MATCH_THRESHOLD ?? "0.58");
  return Number.isFinite(parsed) && parsed > 0.35 && parsed < 0.8 ? parsed : 0.58;
}
