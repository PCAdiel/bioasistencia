import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, distance, invalid, validateDescriptor } from '../_shared/security.ts';

function errorMessage(error: unknown) { if (error instanceof Error) return error.message; if (typeof error === 'object' && error) return JSON.stringify(error); return String(error); }
async function decrypt(ciphertext: string, iv: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', Uint8Array.from(atob(secret), c => c.charCodeAt(0)), 'AES-GCM', false, ['decrypt']);
  const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) }, key, Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0)));
  return Array.from(new Float32Array(bytes));
}
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || ''; invalid(!auth.startsWith('Bearer '), 'Sesión no enviada a la función.');
    const url = Deno.env.get('SUPABASE_URL'), anon = Deno.env.get('SUPABASE_ANON_KEY'), service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), secret = Deno.env.get('BIOMETRIC_ENCRYPTION_KEY');
    invalid(!url || !anon || !service || !secret, 'Faltan secretos internos de Supabase.');
    const caller = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: { user }, error: userError } = await caller.auth.getUser(); if (userError) throw userError; invalid(!user, 'No autenticado.');
    const { data: profile, error: profileError } = await caller.from('profiles').select('active').eq('id', user.id).single(); if (profileError) throw profileError; invalid(!profile?.active, 'Usuario inactivo.');
    const body = await req.json(); invalid(body.liveness_passed !== true, 'Se requiere prueba de vida.'); const descriptor = validateDescriptor(body.descriptor);
    const admin = createClient(url, service);
    const { data: templates, error: templateError } = await admin.from('biometric_templates').select('student_id,descriptor_ciphertext,descriptor_iv,students!inner(id,first_names,last_names,status)'); if (templateError) throw templateError;
    let best: any;
    for (const template of templates || []) { const student = (template as any).students; if (student.status !== 'activo') continue; const matchDistance = distance(descriptor, await decrypt(template.descriptor_ciphertext, template.descriptor_iv, secret)); if (!best || matchDistance < best.distance) best = { student, distance: matchDistance }; }
    const threshold = Number(Deno.env.get('FACE_MATCH_THRESHOLD') || '0.58'); invalid(!best || best.distance > threshold, 'Rostro no reconocido. Registre nuevamente la biometría con buena iluminación.');
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
    const { data: row, error: attendanceReadError } = await admin.from('attendance').select('*').eq('student_id', best.student.id).eq('attendance_date', today).is('course_id', null).maybeSingle(); if (attendanceReadError) throw attendanceReadError;
    let status = 'entrada';
    if (!row) { const { error } = await admin.from('attendance').insert({ student_id: best.student.id, attendance_date: today, entry_at: new Date().toISOString(), match_distance: best.distance }); if (error) throw error; }
    else if (row.exit_at) status = 'Jornada completada';
    else if (Date.now() - new Date(row.entry_at).getTime() < 5 * 60_000) status = 'Espere al menos 5 minutos para registrar salida';
    else { const { error } = await admin.from('attendance').update({ exit_at: new Date().toISOString(), match_distance: best.distance }).eq('id', row.id); if (error) throw error; status = 'salida'; }
    const { error: auditError } = await admin.from('audit_logs').insert({ user_id: user.id, action: 'attendance.' + status, entity: 'student', entity_id: best.student.id, metadata: { distance: best.distance } }); if (auditError) console.error('audit_logs:', auditError);
    return Response.json({ student_name: `${best.student.first_names} ${best.student.last_names}`, status, message: `${best.student.first_names} ${best.student.last_names}: ${status}`, distance: best.distance }, { headers: corsHeaders });
  } catch (error) { const message = errorMessage(error); console.error('recognize-attendance:', message); return Response.json({ message }, { status: 400, headers: corsHeaders }); }
});
