import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;
  constructor() {
    const url = (globalThis as any).NG_APP_SUPABASE_URL || '';
    const key = (globalThis as any).NG_APP_SUPABASE_ANON_KEY || '';
    this.client = createClient(url, key);
  }
  configured() { return !!this.client && !!((globalThis as any).NG_APP_SUPABASE_URL); }
  async invokePublicFunction(name: string, body: unknown) {
    const url = (globalThis as any).NG_APP_SUPABASE_URL as string;
    const key = (globalThis as any).NG_APP_SUPABASE_ANON_KEY as string;
    if (!url || !key) throw new Error('Falta configurar la URL o la clave pública de Supabase.');
    const response = await fetch(`${url}/functions/v1/${name}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` }, body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || `La función ${name} falló (HTTP ${response.status}).`);
    return result;
  }
  async invokeAuthenticatedFunction(name: string, body: unknown) {
    const url = (globalThis as any).NG_APP_SUPABASE_URL as string;
    const key = (globalThis as any).NG_APP_SUPABASE_ANON_KEY as string;
    const { data: { session } } = await this.client.auth.getSession();
    if (!url || !key || !session) throw new Error('Su sesión no está disponible. Vuelva a iniciar sesión.');
    const response = await fetch(`${url}/functions/v1/${name}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || `La función ${name} falló (HTTP ${response.status}).`);
    return result;
  }
}
