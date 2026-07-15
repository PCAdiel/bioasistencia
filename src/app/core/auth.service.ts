import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly profile = signal<any>(null); readonly ready = signal(false);
  constructor(private supabase: SupabaseService) { this.restore(); }
  async restore() { const { data } = await this.supabase.client.auth.getUser(); if (data.user) await this.loadProfile(data.user.id); this.ready.set(true); }
  async loadProfile(id: string) { const { data } = await this.supabase.client.from('profiles').select('*').eq('id', id).single(); this.profile.set(data); }
  async login(email: string, password: string) { const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password }); if (error) throw error; if (data.user) await this.loadProfile(data.user.id); }
  async logout() { await this.supabase.client.auth.signOut(); this.profile.set(null); }
  isAdmin() { return this.profile()?.role === 'admin'; }
}
