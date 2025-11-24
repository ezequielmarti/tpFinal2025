import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { Url } from '../../../common/const';
import { withAuthRetry } from '../../../helpers/http-helper';
import { PartialProductSchema } from '../../../schema/Product/product';
import { AuthService } from '../../general/login/auth-managment';

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

    withAuthRetry<PartialProductSchema[]>(() =>
      this.http.get<PartialProductSchema[]>(`${this.apiUrl}`,{withCredentials: true}),
      this.authService
    ).pipe(
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

  updateDiscount (productId: string, discount: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    withAuthRetry<void>(() =>
      this.http.patch<void>(`${this.apiUrl}/discount/${productId}`, {discount}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === productId) {
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

  updateStock (productId: string, delta: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    withAuthRetry<number>(() =>
      this.http.patch<number>(`${this.apiUrl}/stock/${productId}`, {delta}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === productId) {
                return {...d, stock: result};
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

  updatePrice (productId: string, price: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    withAuthRetry<void>(() =>
      this.http.patch<void>(`${this.apiUrl}/price/${productId}`, {price}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === productId) {
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
