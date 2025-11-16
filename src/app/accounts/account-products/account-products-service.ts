import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { Url } from '../../../common/const';
import { withAuthRetry } from '../../../helpers/http-helper';
import { PartialProductSchema } from '../../../schema/Product/product';
import { AuthService } from '../../service/auth-managment';

@Injectable({
  providedIn: 'root',
})
export class AccountProductService {
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  accountProductsState = signal({
    data: null as PartialProductSchema[] | null,
    loading: false,
    updateLoading: false,
    updateError: null as string | null, 
    error: null as string | null
  });

  getProductList () {
    this.accountProductsState.update(() => ({
      data: null,
      loading: true,
      updateLoading: false,
      updateError: null,
      error: null
    }));

    if (!Url) {
      this.http.get<{ users: Array<{ id: string; username: string }>; products: PartialProductSchema[] }>('/mock/db.json')
      .pipe(
        tap({
          next: (res) => {
            const currentUser = this.authService.authState().username;
            const user = res.users.find(u => u.username === currentUser);
            const list = user ? res.products.filter(p => (p as any).ownerId === user.id) : [];
            this.accountProductsState.update((state) => ({
              ...state,
              data: list,
              loading: false
            }));
          }
        }),
        catchError((err) => {
          this.accountProductsState.update((state) => ({
            ...state,
            loading: false,
            error: err.error?.message || 'Error al cargar los productos'
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    const endpoint = `${this.apiUrl}/user/list`;
    const requestFn = () =>
      this.http.get<PartialProductSchema[]>(endpoint, { withCredentials: true });

    withAuthRetry<PartialProductSchema[]>(requestFn, this.authService).pipe(
      tap({
        next: (result) => {
          this.accountProductsState.update((state) => ({
          ...state,
          data: result,
          loading: false
        }));
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al cargar los productos'
        }));
        return of(null);
      })
    ).subscribe();
  }

  updateDiscount (id: string, discount: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    withAuthRetry<void>(() =>
      this.http.patch<void>(`${this.apiUrl}/discount/${id}`, {discount}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === id) {
                return {...d, discountPercentage: discount};
              }
              return d;
            });
            return {  
              ...state,
              data: newData,
              updateLoading: false,
              updateError: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al actualizar el porcentaje de descuento'
        }));
        return of(null);
      })
    ).subscribe();
  }

  updateStock (id: string, stock: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    withAuthRetry<void>(() =>
      this.http.patch<void>(`${this.apiUrl}/stock/${id}`, {stock}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === id) {
                const aux = d.stock + stock;
                return {...d, stock: aux};
              }
              return d;
            });
            return {  
              ...state,
              data: newData,
              updateLoading: false,
              updateError: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al actualizar el stock'
        }));
        return of(null);
      })
    ).subscribe();
  }

  updatePrice (id: string, price: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    withAuthRetry<void>(() =>
      this.http.patch<void>(`${this.apiUrl}/price/${id}`, {price}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === id) {
                return {...d, price};
              }
              return d;
            });
            return {  
              ...state,
              data: newData,
              updateLoading: false,
              updateError: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al actualizar el precio'
        }));
        return of(null);
      })
    ).subscribe();
  }
}
