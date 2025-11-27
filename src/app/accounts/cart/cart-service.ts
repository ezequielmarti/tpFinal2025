import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CartSchema } from '../../../schema/cart/cart';
import { Url, isMockApi } from '../../../common/const';
import { AuthService } from '../../general/login/auth-managment';
import { withAuthRetry } from '../../../helpers/http-helper';
import { catchError, of, switchMap, tap, map } from 'rxjs';
import { CartProductSchema } from '../../../schema/cart/cart-product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${Url}/cart`;
  private http = inject(HttpClient);
   private authService = inject(AuthService);

  cartState = signal({
    data: null as CartSchema | null,
    loading: false,
    error: null as string | null
  });

  getCart () {
    this.cartState.update(() => ({
      data: null,
      loading: true,
      error: null
    }));
    
    if (isMockApi) {
      this.resolveUserId().pipe(
        switchMap((userId) =>
          this.http.get<CartSchema[]>(`${this.apiUrl}`, {
            params: new HttpParams().set('userId', userId)
          })
        ),
        tap((carts) => {
          const result = carts?.[0] || null;
          this.cartState.update(() => ({
            data: result,
            loading: false,
            error: null
          }));
        }),
        catchError((err) => {
          this.cartState.update((state) => ({
            ...state,
            loading: false,
            error: err.error?.message || 'Error al cargar el carrito'
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    withAuthRetry<CartSchema>(() =>
      this.http.get<CartSchema>(`${this.apiUrl}`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.cartState.update(() => ({
            data: result,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.cartState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al cargar el carito'
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteCart () {
    this.cartState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));
    
    if (isMockApi) {
      this.resolveUserId().pipe(
        switchMap((userId) => {
          if (!userId) {
            throw new Error('No se encontr�� la cuenta');
          }
          const params = new HttpParams().set('userId', userId);
          return this.http.get<CartSchema[]>(`${this.apiUrl}`, { params }).pipe(
            switchMap((carts) => {
              const current = carts?.[0];
              if (!current || !current.id) {
                return of(null);
              }
              return this.http.delete<void>(`${this.apiUrl}/${current.id}`).pipe(map(() => current.id));
            })
          );
        }),
        tap(() => {
          this.cartState.update(() => ({
            data: null,
            loading: false,
            error: null
          }));
        }),
        catchError((err) => {
          this.cartState.update((state) => ({
            ...state,
            loading: false,
            error: err.error?.message || err.message || 'Error al eliminar el carrito'
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.cartState.update(() => ({
            data: null,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.cartState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al eliminar el carrito'
        }));
        return of(null);
      })
    ).subscribe();
  }

  addToCart(product: CartProductSchema): void {
    const user = this.authService.authState().username;
    if (!user) {
      this.cartState.update((state) => ({
        ...state,
        error: 'Debes iniciar sesión para agregar al carrito'
      }));
      return;
    }

    if (isMockApi) {
      this.resolveUserId().pipe(
        switchMap((userId) => {
          const params = new HttpParams().set('userId', userId);
          return this.http.get<any[]>(`${this.apiUrl}`, { params }).pipe(
            switchMap((carts) => {
              const existing = carts?.[0];
              if (existing && existing.id) {
                const products = [...(existing.products || [])];
                const idx = products.findIndex((p) => p.productId === product.productId);
                if (idx >= 0) {
                  products[idx] = { ...products[idx], amount: products[idx].amount + product.amount };
                } else {
                  products.push(product);
                }
                const filtered = products.filter((p) => p.amount > 0);
                const updated = { ...existing, products: filtered, userId: userId, updated: new Date().toISOString() };
                return this.http.put<CartSchema>(`${this.apiUrl}/${existing.id}`, updated);
              } else {
                const newCart: CartSchema & { userId: string } = {
                  id: `c-${userId}`,
                  created: new Date(),
                  updated: new Date(),
                  products: [product],
                  userId
                };
                return this.http.post<CartSchema>(`${this.apiUrl}`, newCart);
              }
            })
          );
        }),
        tap((result) => {
          this.cartState.update(() => ({
            data: result,
            loading: false,
            error: null
          }));
        }),
        catchError((err) => {
          this.cartState.update((state) => ({
            ...state,
            error: err.error?.message || 'Error al agregar al carrito'
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    withAuthRetry<CartSchema>(() =>
      this.http.post<CartSchema>(`${this.apiUrl}/add`, { productId: product.productId, amount: product.amount }, { withCredentials: true }),
      this.authService
    ).pipe(
      tap((result) => {
        this.cartState.update(() => ({
          data: result,
          loading: false,
          error: null
        }));
      }),
      catchError((err) => {
        this.cartState.update((state) => ({
          ...state,
          error: err.error?.message || 'Error al agregar al carrito'
        }));
        return of(null);
      })
    ).subscribe();
  }

  updateQuantity(productId: string, delta: number): void {
    const user = this.authService.authState().username;
    if (!user) return;

    if (isMockApi) {
      this.resolveUserId().pipe(
        switchMap((userId) => {
          const params = new HttpParams().set('userId', userId);
          return this.http.get<any[]>(`${this.apiUrl}`, { params }).pipe(
            switchMap((carts) => {
              const existing = carts?.[0];
              if (!existing || !existing.id) {
                return of(null);
              }
              const products = [...(existing.products || [])];
              const idx = products.findIndex((p) => p.productId === productId);
              if (idx >= 0) {
                products[idx] = { ...products[idx], amount: products[idx].amount + delta };
              }
              const filtered = products.filter((p) => p.amount > 0);
              const updated = { ...existing, products: filtered, updated: new Date().toISOString(), userId };
              return this.http.put<CartSchema>(`${this.apiUrl}/${existing.id}`, updated);
            })
          );
        }),
        tap((result) => {
          if (result) {
            this.cartState.update(() => ({
              data: result,
              loading: false,
              error: null
            }));
          }
        }),
        catchError((err) => {
          this.cartState.update((state) => ({
            ...state,
            error: err.error?.message || 'Error al actualizar carrito'
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    // En backend real, intenta usar addToCart con delta como cantidad (puede ser negativo si el API lo permite).
    withAuthRetry<CartSchema>(() =>
      this.http.post<CartSchema>(`${this.apiUrl}/add`, { productId, amount: delta }, { withCredentials: true }),
      this.authService
    ).pipe(
      tap((result) => {
        this.cartState.update(() => ({
          data: result,
          loading: false,
          error: null
        }));
      }),
      catchError((err) => {
        this.cartState.update((state) => ({
          ...state,
          error: err.error?.message || 'Error al actualizar carrito'
        }));
        return of(null);
      })
    ).subscribe();
  }

  removeItem(productId: string): void {
    const cart = this.cartState().data;
    if (!cart) return;
    const item = cart.products.find((p) => p.productId === productId);
    if (!item) return;
    this.updateQuantity(productId, -item.amount);
  }

  private resolveUserId() {
    const username = this.authService.authState().username;
    if (!username) {
      return of('');
    }
    if (!isMockApi) {
      return of(username);
    }
    const params = new HttpParams().set('username', username);
    return this.http.get<{ id?: string }[]>(`${Url}/account`, { params }).pipe(
      switchMap((accounts) => {
        const user = accounts?.[0];
        return of(user?.id || username);
      })
    );
  }
}
