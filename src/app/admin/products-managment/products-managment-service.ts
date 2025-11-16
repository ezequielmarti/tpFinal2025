import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { Url } from '../../../common/const';
const STORAGE_KEY = 'admin.banned.users';

@Injectable({
  providedIn: 'root',
})
export class ProductsManagmentService {
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);

  state = signal({
    products: [] as Array<{ id: string; title: string; ownerId?: string }>,
    blocked: [] as Array<{ id: string; title: string; ownerId?: string }>,
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
    this.state.update(() => ({ products: [], blocked: [], loading: true, error: null }));
    const banned = new Set(this.getStoredBanned());

    if (!Url) {
      this.http.get<{ products: any[] }>('/mock/db.json')
        .pipe(
          tap((res) => {
            const products = res.products.map(p => ({ id: p.id, title: p.title, ownerId: p.ownerId }));
            const blocked = products.filter(p => p.ownerId && banned.has(p.ownerId));
            const active = products.filter(p => !blocked.find(b => b.id === p.id));
            this.state.update((s) => ({ ...s, products: active, blocked, loading: false }));
          }),
          catchError((err) => {
            this.state.update((s) => ({ ...s, loading: false, error: err.error?.error || 'Error cargando productos' }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    this.http.get<Array<{ id: string; title: string; ownerId?: string }>>(`${this.apiUrl}/list`)
      .pipe(
        tap((list) => this.state.update((s) => ({ ...s, products: list, loading: false }))),
        catchError((err) => {
          this.state.update((s) => ({ ...s, loading: false, error: err.error?.error || 'Error cargando productos' }));
          return of(null);
        })
      ).subscribe();
  }

  disableProduct(id: string) {
    this.state.update((s) => {
      const prod = s.products.find(p => p.id === id);
      if (!prod) return s;
      return {
        ...s,
        products: s.products.filter(p => p.id !== id),
        blocked: [...s.blocked, prod]
      };
    });
  }

  enableProduct(id: string) {
    this.state.update((s) => {
      const prod = s.blocked.find(p => p.id === id);
      if (!prod) return s;
      return {
        ...s,
        blocked: s.blocked.filter(p => p.id !== id),
        products: [...s.products, prod]
      };
    });
  }

  removeProduct(id: string) {
    this.state.update((s) => ({
      ...s,
      blocked: s.blocked.filter(p => p.id !== id),
      products: s.products.filter(p => p.id !== id)
    }));
  }

  banOwner(ownerId?: string) {
    if (!ownerId) return;
    const ids = Array.from(new Set([...this.getStoredBanned(), ownerId]));
    this.persistBanned(ids);
    this.state.update((s) => {
      return {
        ...s,
        products: s.products.filter(p => p.ownerId !== ownerId),
        blocked: s.blocked.filter(p => p.ownerId !== ownerId)
      };
    });
  }
}
