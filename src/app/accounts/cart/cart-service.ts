import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CartSchema } from '../../../schema/cart/cart';
import { Url } from '../../../common/const';
import { AuthService } from '../../general/login/auth-managment';
import { withAuthRetry } from '../../../helpers/http-helper';
import { catchError, of, tap } from 'rxjs';

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
}
