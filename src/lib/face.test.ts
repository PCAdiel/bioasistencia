import { describe, expect, it } from "vitest";
import { averageDescriptors, euclideanDistance, validateDescriptor } from "./face";

describe("utilidades biométricas", () => {
  it("calcula la distancia euclidiana", () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5);
  });

  it("promedia muestras de 128 dimensiones", () => {
    const result = averageDescriptors([Array(128).fill(0), Array(128).fill(2)]);
    expect(result).toHaveLength(128);
    expect(result[0]).toBe(1);
  });

  it("rechaza descriptores con longitud incorrecta", () => {
    expect(validateDescriptor([1, 2])).toBe(false);
  });
});
