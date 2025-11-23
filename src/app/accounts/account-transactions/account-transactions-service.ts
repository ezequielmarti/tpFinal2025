import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url } from '../../../common/const';
import { AuthService } from '../../general/login/auth-managment';
import { OrderSchema } from '../../../schema/order/order';
import { withAuthRetry } from '../../../helpers/http-helper';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountTransactionsService {
  private apiUrl = `${Url}/order`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  transactionState = signal({
    shoppingList: {
      data: [] as OrderSchema[],
      loading: false,
      error: null as string | null
    },
    salesList: {
      data: [] as OrderSchema[],
      loading: false,
      error: null as string | null
    }
  });

  getShoppingList (){
    this.transactionState.update((state) => ({
      ...state,
      shoppingList: {
        data: [],
        loading: true,
        error: null
      }
    }));
    
    withAuthRetry<OrderSchema[]>(() =>
      this.http.get<OrderSchema[]>(`${this.apiUrl}/shopping`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.transactionState.update((state) => ({
          ...state,
          shoppingList: {
            data: result,
            loading: false,
            error: null
          }
        }));
        }
      }),
      catchError((err) => {
        this.transactionState.update((state) => ({
          ...state,
          shoppingList: {
            ...state.shoppingList,
            loading: false,
            error: err.error?.message || 'Error al cargar los recibos de compras'
          }
        }));
        return of(null);
      })
    ).subscribe();
  }

  getSalesList (){
    this.transactionState.update((state) => ({
      ...state,
      salesList: {
        data: [],
        loading: true,
        error: null
      }
    }));
    
    withAuthRetry<OrderSchema[]>(() =>
      this.http.get<OrderSchema[]>(`${this.apiUrl}/sales`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.transactionState.update((state) => ({
          ...state,
          salesList: {
            data: result,
            loading: false,
            error: null
          }
        }));
        }
      }),
      catchError((err) => {
        this.transactionState.update((state) => ({
          ...state,
          salesList: {
            ...state.salesList,
            loading: false,
            error: err.error?.message || 'Error al cargar los recibos de ventas'
          }
        }));
        return of(null);
      })
    ).subscribe();
  }
}
