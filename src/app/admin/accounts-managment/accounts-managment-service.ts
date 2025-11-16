import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url } from '../../../common/const';
const STORAGE_KEY = 'admin.banned.users';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountsManagmentService {
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);
  state = signal({
    users: [] as Array<{ id: string; username: string; email: string; role: string }>,
    banned: [] as Array<{ id: string; username: string; email: string; role: string }>,
    loading: false,
    error: null as string | null
  });

  private getStoredBanned(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persistBanned(ids: string[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }

  load() {
    this.state.update(() => ({ users: [], banned: [], loading: true, error: null }));
    const storedBanned = this.getStoredBanned();

    if (!Url) {
      this.http.get<{ users: any[] }>('/mock/db.json')
        .pipe(
          tap((res) => {
            const all = res.users
              .filter(u => u.role !== 'admin')
              .map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, banned: u.banned }));
            const banned = all.filter(u => u.banned || storedBanned.includes(u.id));
            const users = all.filter(u => !banned.find(b => b.id === u.id));
            this.state.update((s) => ({ ...s, users, banned, loading: false }));
          }),
          catchError((err) => {
            this.state.update((s) => ({ ...s, loading: false, error: err.error?.error || 'Error cargando usuarios' }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    this.http.get<Array<{ id: string; username: string; email: string; role: string }>>(`${this.apiUrl}/list`)
      .pipe(
        tap((users) => {
          const filtered = users.filter(u => u.role !== 'admin');
          this.state.update((s) => ({ ...s, users: filtered, loading: false }));
        }),
        catchError((err) => {
          this.state.update((s) => ({ ...s, loading: false, error: err.error?.error || 'Error cargando usuarios' }));
          return of(null);
        })
      ).subscribe();
  }

  ban(id: string) {
    this.state.update((s) => {
      const user = s.users.find(u => u.id === id);
      if (!user) return s;
      const bannedIds = this.getStoredBanned();
      const nextIds = Array.from(new Set([...bannedIds, id]));
      this.persistBanned(nextIds);
      return {
        ...s,
        users: s.users.filter(u => u.id !== id),
        banned: [...s.banned, user]
      };
    });
  }

  unban(id: string) {
    this.state.update((s) => {
      const user = s.banned.find(u => u.id === id);
      if (!user) return s;
      const bannedIds = this.getStoredBanned().filter(b => b !== id);
      this.persistBanned(bannedIds);
      return {
        ...s,
        banned: s.banned.filter(u => u.id !== id),
        users: [...s.users, user]
      };
    });
  }

  remove(id: string) {
    const bannedIds = this.getStoredBanned().filter(b => b !== id);
    this.persistBanned(bannedIds);
    this.state.update((s) => ({
      ...s,
      banned: s.banned.filter(u => u.id !== id),
      users: s.users.filter(u => u.id !== id)
    }));
  }
}
