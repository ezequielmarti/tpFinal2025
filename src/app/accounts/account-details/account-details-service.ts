import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { tap, catchError, of, switchMap } from "rxjs";
import { Url, isMockApi } from "../../../common/const";
import { withAuthRetry } from "../../../helpers/http-helper";
import { AccountSchema } from "../../../schema/user/account";
import { AuthService } from "../../general/login/auth-managment";
import { UpdateAdminSchema, UpdateBusinessSchema, UpdateUserSchema } from "../../../schema/user/create-account";
import { CreateAddressSchema, CreateStoreSchema } from "../../../schema/user/create-address-store";
import { ERole } from "../../../enum/role";


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

    if (isMockApi) {
      const username = this.authService.authState().username;
      if (!username) {
        this.accountState.update(() => ({
          data: null,
          loading: false,
          error: 'No hay sesión activa'
        }));
        return;
      }
      const params = new HttpParams().set('username', username);
      this.http.get<AccountSchema[]>(`${Url}/account`, { params })
        .pipe(
          tap((accounts) => {
            const base = accounts?.[0] as (AccountSchema & { id?: string }) | undefined;
            if (!base) {
              this.accountState.update(() => ({
                data: null,
                loading: false,
                error: 'No se encontró la cuenta'
              }));
              return;
            }
            const normalized: AccountSchema = {
              id: (base as any).id ?? '',
              username: base.username,
              role: base.role,
              status: (base as any).status ?? null,
              email: (base as any).email ?? '',
              meta: {
                created: (base as any).meta?.created ?? new Date(),
                updated: (base as any).meta?.updated ?? new Date(),
                deletedBy: (base as any).meta?.deletedBy ?? null
              },
              userProfile: (base as any).userProfile ?? ({
                firstname: (base as any).firstname,
                lastname: (base as any).lastname,
                birth: (base as any).birth,
                phone: (base as any).phone,
              } as any),
              businessProfile: (base as any).businessProfile,
              adminProfile: (base as any).adminProfile,
              address: (base as any).address ?? [],
              store: (base as any).store ?? []
            };
            this.accountState.update(() => ({
              data: normalized,
              loading: false,
              error: null
            }));
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
      return;
    }

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

    if (isMockApi) {
      const username = this.authService.authState().username;
      if (!username) {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: 'No se encontró la cuenta'
        }));
        return;
      }
      const params = new HttpParams().set('username', username);
      this.http.get<AccountSchema[]>(`${Url}/account`, { params })
        .pipe(
          switchMap((accounts) => {
            const current = accounts?.[0] as (AccountSchema & { id?: string }) | undefined;
            if (!current || !current.id) {
              throw new Error('No se encontró la cuenta');
            }
            return this.http.patch<AccountSchema>(`${Url}/account/${current.id}`, {
              ...account,
              role: (account as any).role || current.role
            });
          }),
          tap((result) => {
            this.accountState.update(() => ({
              data: result,
              loading: false,
              error: null
            }));
          }),
          catchError((err) => {
            this.accountState.update((state) => ({
              ...state,
              loading: false,
              error: err.error?.message || err.message || 'Error actualizando los datos'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

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
          this.getInfo();
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

  requestSellerUpgrade(payload: { title: string; contactEmail: string }): void {
    this.accountState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    if (isMockApi) {
      const username = this.authService.authState().username;
      if (!username) {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: 'No se encontró la cuenta'
        }));
        return;
      }
      const params = new HttpParams().set('username', username);
      this.http.get<AccountSchema[]>(`${Url}/account`, { params })
        .pipe(
          switchMap((accounts) => {
            const current = accounts?.[0] as (AccountSchema & { id?: string }) | undefined;
            if (!current || !current.id) {
              throw new Error('No se encontró la cuenta');
            }
            const update = {
              businessProfile: {
                title: payload.title,
                contactEmail: payload.contactEmail
              },
              role: ERole.Seller
            };
            return this.http.patch<AccountSchema>(`${Url}/account/${current.id}`, update);
          }),
          tap((result) => {
            this.accountState.update(() => ({
              data: result,
              loading: false,
              error: null
            }));
          }),
          catchError((err) => {
            this.accountState.update((state) => ({
              ...state,
              loading: false,
              error: err.error?.message || err.message || 'Error al solicitar cambio a seller'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    const update: UpdateBusinessSchema = {
      title: payload.title,
      contactEmail: payload.contactEmail
    };
    withAuthRetry<AccountSchema>(() =>
      this.http.put<AccountSchema>(`${this.apiUrl}`, { account: { ...update, role: ERole.Seller } as any }, { withCredentials: true }),
      this.authService
    ).pipe(
      tap((result) => {
        this.accountState.update(() => ({
          data: result,
          loading: false,
          error: null
        }));
      }),
      catchError((err) => {
        this.accountState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al solicitar cambio a seller'
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
