import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AccountSchema } from '../../schema/user/account';
import { Url } from '../../common/const';
import { catchError, of, tap } from 'rxjs';
import { withAuthRetry } from '../../helpers/http-helper';
import { AuthService } from '../service/auth-managment';
import { UpdateBusiness, UpdateUser } from '../../schema/user/create-account';
import { CreateAddress, CreateStore } from '../../schema/user/create-address-store';


@Injectable({
  providedIn: 'root',
})
export class AccountDetailsService {
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  accountState = signal({
    data: null as AccountSchema | null,
    loading: false,
    error: null as string | null
  });

  getInfo(): void {
    this.accountState.update(() => ({
      data: null,
      loading: true,
      error: null
    }));

    withAuthRetry<{data: AccountSchema}>(() =>
      this.http.get<{data: AccountSchema}>(`${this.apiUrl}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountState.update(() => ({
            data: result.data,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((error) => {
        this.accountState.update(() => ({
          data: null,
          loading: false,
          error: error.error?.error || 'Error cargando los datos' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  // user y business estan definidos los campos actualizables, 
  // admin solo puede cambiar el public username por eso recibe string
  updateAccount(account: UpdateBusiness | UpdateUser | string): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<{data: AccountSchema}>(() =>
      this.http.put<{data: AccountSchema}>(`${this.apiUrl}`, account, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountState.update(() => ({
            data: result.data,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((error) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error actualizando los datos' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  delete(): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountState.update(() => ({
            data: null,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((error) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error eliminando la cuenta' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  addAddress(address: CreateAddress): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<{data: AccountSchema}>(() =>
      this.http.post<{data: AccountSchema}>(`${this.apiUrl}/address`, {address}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountState.update(() => ({
            data: result.data,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((error) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error creando la nueva direccion.' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteAddress(id: string): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}/address/${id}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountState.update((state) => {
            const address = state.data!.address?.filter((a) => a.id !== id) ?? [];
            return {
              data: { ...state.data!, address },
              loading: false,
              error: null
            };
          });
        }
      }),
      catchError((error) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error eliminando la direccion.' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  addStore(store: CreateStore): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<{data: AccountSchema}>(() =>
      this.http.post<{data: AccountSchema}>(`${this.apiUrl}/store`, {store}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountState.update(() => ({
            data: result.data,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((error) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error creando el local.' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteStore(id: string): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}/store/${id}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountState.update((state) => {
            const store = state.data!.store?.filter((s) => s.id !== id) ?? [];
            return {
              data: { ...state.data!, store },
              loading: false,
              error: null
            };
          });
        }
      }),
      catchError((error) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error eliminando el local.' 
        }));
        return of(null);
      })
    ).subscribe();
  }
}
