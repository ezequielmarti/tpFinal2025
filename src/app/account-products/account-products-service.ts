import { inject, Injectable, signal } from '@angular/core';
import { Url } from '../../common/const';
import { HttpClient } from '@angular/common/http';
import { PartialProductSchema } from '../../schema/Product/product';
import { AuthService } from '../service/auth-managment';
import { withAuthRetry } from '../../helpers/http-helper';
import { catchError, of, tap } from 'rxjs';

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
      catchError((error) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: error.error?.message || 'Error al actualizar el precio'
        }));
        return of(null);
      })
    ).subscribe();
  }
}
