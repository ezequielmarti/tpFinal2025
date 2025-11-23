import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { tap, catchError, of } from "rxjs";
import { Url } from "../../../common/const";
import { withAuthRetry } from "../../../helpers/http-helper";
import { AccountSchema } from "../../../schema/user/account";
import { AuthService } from "../../general/login/auth-managment";
import { UpdateAdminSchema, UpdateBusinessSchema, UpdateUserSchema } from "../../../schema/user/create-account";
import { CreateAddressSchema, CreateStoreSchema } from "../../../schema/user/create-address-store";


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

    withAuthRetry<AccountSchema>(() =>
      this.http.get<AccountSchema>(`${this.apiUrl}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountState.update(() => ({
            data: result,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.accountState.update(() => ({
          data: null,
          loading: false,
          error: err.error?.message || 'Error cargando los datos' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  updateAccount(account: UpdateBusinessSchema | UpdateUserSchema | UpdateAdminSchema): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<AccountSchema>(() =>
      this.http.put<AccountSchema>(`${this.apiUrl}`, {account}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountState.update(() => ({
            data: result,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error actualizando los datos' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  addAddress(address: CreateAddressSchema): void {
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
      catchError((err) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error creando la nueva direccion.' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteAddress(addressId: string): void { 
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}/address/${addressId}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountState.update((state) => {
            const address = state.data!.address?.filter((a) => a.id !== addressId) ?? [];
            return {
              data: { ...state.data!, address },
              loading: false,
              error: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error eliminando la direccion.' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  addStore(store: CreateStoreSchema): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<AccountSchema>(() =>
      this.http.post<AccountSchema>(`${this.apiUrl}/store`, {store}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountState.update(() => ({
            data: result,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.error || 'Error creando el local.' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteStore(storeId: string): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}/store/${storeId}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountState.update((state) => {
            const store = state.data!.store?.filter((s) => s.id !== storeId) ?? [];
            return {
              data: { ...state.data!, store },
              loading: false,
              error: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error eliminando el local.' 
        }));
        return of(null);
      })
    ).subscribe();
  }

  // es post porque realmente no la borra en la base de datos, solamentecambia el estado.
  deleteAccount(password: string): void { 
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<void>(() =>
      this.http.post<void>(`${this.apiUrl}`, { password }, { withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountState.update(() => {
            return {
              data: null,
              loading: false,
              error: null
            };
          });
          this.authService.setState();
        }
      }),
      catchError((err) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al borrar la cuenta.' 
        }));
        return of(null);
      })
    ).subscribe();
  }
}
