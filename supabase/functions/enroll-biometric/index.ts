import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, invalid, validateDescriptor } from '../_shared/security.ts';

function errorMessage(error: unknown) { if (error instanceof Error) return error.message; if (typeof error === 'object' && error) return JSON.stringify(error); return String(error); }
async function encrypt(descriptor: number[]) {
  const secret = Deno.env.get('BIOMETRIC_ENCRYPTION_KEY'); invalid(!secret, 'Falta el secreto BIOMETRIC_ENCRYPTION_KEY.');
  const raw = Uint8Array.from(descriptor.flatMap(value => Array.from(new Uint8Array(new Float32Array([value]).buffer))));
  const key = await crypto.subtle.importKey('raw', Uint8Array.from(atob(secret), c => c.charCodeAt(0)), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12)); const bytes = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, raw);
  return { ciphertext: btoa(String.fromCharCode(...new Uint8Array(bytes))), iv: btoa(String.fromCharCode(...iv)) };
}
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || ''; invalid(!auth.startsWith('Bearer '), 'Sesión no enviada a la función.');
    const url = Deno.env.get('SUPABASE_URL'), anon = Deno.env.get('SUPABASE_ANON_KEY'), service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); invalid(!url || !anon || !service, 'Faltan secretos internos de Supabase.');
    const caller = createClient(url, anon, { global: { headers: { Authorization: auth } } }); const { data: { user }, error: userError } = await caller.auth.getUser(); if (userError) throw userError; invalid(!user, 'No autenticado.');
    const { data: profile, error: profileError } = await caller.from('profiles').select('role,active').eq('id', user.id).single(); if (profileError) throw profileError; invalid(!profile?.active || !['admin', 'docente'].includes(profile.role), 'Usuario sin permiso para enrolar biometría.');
    const body = await req.json(), descriptor = validateDescriptor(body.descriptor); invalid(typeof body.student_id !== 'string', 'Alumno inválido.');
    const encrypted = await encrypt(descriptor); const admin = createClient(url, service);
    const { error } = await admin.from('biometric_templates').upsert({ student_id: body.student_id, descriptor_ciphertext: encrypted.ciphertext, descriptor_iv: encrypted.iv }, { onConflict: 'student_id' }); if (error) throw error;
    const { error: auditError } = await admin.from('audit_logs').insert({ user_id: user.id, action: 'biometric.enroll', entity: 'student', entity_id: body.student_id }); if (auditError) console.error('audit_logs:', auditError);
    return Response.json({ message: 'Plantilla cifrada y guardada correctamente.' }, { headers: corsHeaders });
  } catch (error) { const message = errorMessage(error); console.error('enroll-biometric:', message); return Response.json({ message }, { status: 400, headers: corsHeaders }); }
});
