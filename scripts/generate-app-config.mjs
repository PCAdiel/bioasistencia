import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const url = process.env.NG_APP_SUPABASE_URL;
const key = process.env.NG_APP_SUPABASE_ANON_KEY;
const threshold = process.env.NG_APP_FACE_MATCH_THRESHOLD || '0.58';
const target = 'public/app-config.js';

// Las variables de Vercel tienen prioridad. Si no están definidas, se conserva
// el archivo público versionado para despliegues académicos rápidos.
if (!url || !key) {
  if (existsSync(target)) process.exit(0);
  throw new Error('Crea public/app-config.js desde public/app-config.example.js para desarrollo local.');
}

mkdirSync('public', { recursive: true });
writeFileSync(target, `globalThis.NG_APP_SUPABASE_URL = ${JSON.stringify(url)};\nglobalThis.NG_APP_SUPABASE_ANON_KEY = ${JSON.stringify(key)};\nglobalThis.NG_APP_FACE_MATCH_THRESHOLD = ${JSON.stringify(threshold)};\n`);
