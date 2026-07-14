const ALGORITHM = "AES-GCM";

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string) {
  return new Uint8Array(Buffer.from(value, "base64"));
}

async function getKey() {
  const encoded = process.env.BIOMETRIC_ENCRYPTION_KEY;
  if (!encoded) throw new Error("BIOMETRIC_ENCRYPTION_KEY no está configurada.");
  const raw = fromBase64(encoded);
  if (raw.byteLength !== 32) throw new Error("La clave biométrica debe contener 32 bytes.");
  return crypto.subtle.importKey("raw", raw, ALGORITHM, false, ["encrypt", "decrypt"]);
}

export async function encryptDescriptor(descriptor: number[]) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(descriptor));
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, await getKey(), plain);
  return { ciphertext: toBase64(new Uint8Array(encrypted)), iv: toBase64(iv) };
}

export async function decryptDescriptor(ciphertext: string, iv: string): Promise<number[]> {
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: fromBase64(iv) },
    await getKey(),
    fromBase64(ciphertext),
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as number[];
}
