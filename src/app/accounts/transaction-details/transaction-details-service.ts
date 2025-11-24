import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url } from '../../../common/const';
import { AuthService } from '../../general/login/auth-managment';
import { withAuthRetry } from '../../../helpers/http-helper';
import { catchError, of, tap } from 'rxjs';
import { OrderSchema } from '../../../schema/order/order';

@Injectable({
  providedIn: 'root',
})
export class TransactionDetailsService {
  private apiUrl = `${Url}/order`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  orderState = signal({
    data: null as OrderSchema | null,
    loading: false,
    error: null as string | null
  });

  getOrderDetails(orderId: string) {
    this.orderState.update(() => ({
      data: null,
      loading: true,
      error: null
    }));
    
    withAuthRetry<OrderSchema>(() =>
      this.http.get<OrderSchema>(`${this.apiUrl}/${orderId}`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.orderState.update(() => ({
            data: result,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.orderState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al cargar los detalles del recivo'
        }));
        return of(null);
      })
    ).subscribe();
  }
}
