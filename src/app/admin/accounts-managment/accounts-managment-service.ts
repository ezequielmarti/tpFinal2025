import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url, isMockApi } from '../../../common/const';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { PartialAccountSchema } from '../../../schema/user/account';
import { withAuthRetry } from '../../../helpers/http-helper';
import { AuthService } from '../../general/login/auth-managment';

@Injectable({
  providedIn: 'root',
})
export class AccountsManagmentService {
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  state = signal({
    accountList:{
      data: [] as PartialAccountSchema[],
      loading: false,
      error: null as string | null
    },
    bannedList:{
      data: [] as PartialAccountSchema[],
      loading: false,
      error: null as string | null
    }
  });

  
  getAccounts(){
    this.state.update((state) => ({
      ...state,
      accountList: {
        data: [],
        loading: true,
        error: null
      }
    }));
    
    if (isMockApi) {
      this.http.get<PartialAccountSchema[]>(`${Url}/account`)
        .pipe(
          tap((result) => {
            this.state.update((state) => ({
              ...state,
              accountList: {
                data: result.filter((a) => a.role !== 'admin'),
                loading: false,
                error: null
              }
            }));
          }),
          catchError((err) => {
            this.state.update((state) => ({
              ...state,
              accountList: {
                ...state.accountList,
                loading: false,
                error: err.error?.message || 'Error al cargar las cuentas'
              }
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    withAuthRetry<PartialAccountSchema[]>(() =>
      this.http.get<PartialAccountSchema[]>(`${this.apiUrl}/admin/list`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.state.update((state) => ({
            ...state,
            accountList: {
              data: result,
              loading: false,
              error: null
            }
          }));
        }
      }),
      catchError((err) => {
        this.state.update((state) => ({
          ...state,
          accountList: {
            ...state.accountList,
            loading: false,
            error: err.error?.message || 'Error al cargar las cuentas'
          }
        }));
        return of(null);
      })
    ).subscribe();
  }

  getBanned(){
    this.state.update((state) => ({
      ...state,
      bannedList: {
        data: [],
        loading: true,
        error: null
      }
    }));
    
    if (isMockApi) {
      this.http.get<PartialAccountSchema[]>(`${Url}/banned`)
        .pipe(
          tap((result) => {
            this.state.update((state) => ({
              ...state,
              bannedList: {
                data: result.filter((a) => a.role !== 'admin'),
                loading: false,
                error: null
              }
            }));
          }),
          catchError((err) => {
            this.state.update((state) => ({
              ...state,
              bannedList: {
                ...state.bannedList,
                loading: false,
                error: err.error?.message || 'Error al cargar las cuentas'
              }
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    withAuthRetry<PartialAccountSchema[]>(() =>
      this.http.get<PartialAccountSchema[]>(`${this.apiUrl}/admin/banned`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.state.update((state) => ({
          ...state,
          bannedList: {
            data: result,
            loading: false,
            error: null
          }
        }));
        }
      }),
      catchError((err) => {
        this.state.update((state) => ({
          ...state,
          bannedList: {
            ...state.bannedList,
            loading: false,
            error: err.error?.message || 'Error al cargar las cuentas'
          }
        }));
        return of(null);
      })
    ).subscribe();
  };

  banAccount(username: string) {
    this.state.update((state) => ({
      ...state,
      accountList: {
        ...state.accountList,
        loading: true,
        error: null
      }
    }));
    if (isMockApi) {
      const params = new HttpParams().set('username', username);
      this.http.get<PartialAccountSchema[]>(`${Url}/account`, { params }).pipe(
        switchMap((accounts) => {
          const user = accounts?.[0] as (PartialAccountSchema & { id?: string }) | undefined;
          if (!user || !user.id) {
            throw new Error('Usuario no encontrado');
          }
          const ownerId = user.id;
          const moveUser$ = this.http.post<PartialAccountSchema>(`${Url}/banned`, user).pipe(
            switchMap(() => this.http.delete<void>(`${Url}/account/${user.id}`))
          );
          const disableProducts$ = this.http.get<{ id: string }[]>(`${Url}/product?ownerId=${ownerId}`).pipe(
            switchMap((products) => {
              const updates = products.map((p) => this.http.patch(`${Url}/product/${p.id}`, { status: 'blocked' }));
              return updates.length ? forkJoin(updates) : of(null);
            })
          );
          return forkJoin([moveUser$, disableProducts$]);
        }),
        tap(() => {
          this.getAccounts();
          this.getBanned();
        }),
        catchError((err) => {
          this.state.update((state) => ({
            ...state,
            accountList: {
              ...state.accountList,
              loading: false,
              error: err.message || 'Error al banear la cuenta'
            }
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    withAuthRetry<void>(() =>
      this.http.post<void>(`${this.apiUrl}/admin/ban/${username}`, {}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.state.update((state) => {
            const result = state.accountList.data.filter((a) => a.username != username)
            return {
              ...state,
              accountList: {
                data: result,
                loading: false,
                error: null
              }
            }  
          });
        }
      }),
      catchError((err) => {
        this.state.update((state) => ({
          ...state,
          accountList: {
            ...state.accountList,
            loading: false,
            error: err.error?.message || 'Error al cargar las cuentas'
          }
        }));
        return of(null);
      })
    ).subscribe();
  }

  unbanAccount(username: string) {
    this.state.update((state) => ({
      ...state,
      bannedList: {
        ...state.bannedList,
        loading: true,
        error: null
      }
    }));
    if (isMockApi) {
      const params = new HttpParams().set('username', username);
      this.http.get<PartialAccountSchema[]>(`${Url}/banned`, { params }).pipe(
        switchMap((accounts) => {
          const user = accounts?.[0] as (PartialAccountSchema & { id?: string }) | undefined;
          if (!user || !user.id) {
            throw new Error('Usuario no encontrado');
          }
          const ownerId = user.id;
          const restoreUser$ = this.http.post<PartialAccountSchema>(`${Url}/account`, user).pipe(
            switchMap(() => this.http.delete<void>(`${Url}/banned/${user.id}`))
          );
          const enableProducts$ = this.http.get<{ id: string }[]>(`${Url}/product?ownerId=${ownerId}`).pipe(
            switchMap((products) => {
              const updates = products.map((p) => this.http.patch(`${Url}/product/${p.id}`, { status: 'active' }));
              return updates.length ? forkJoin(updates) : of(null);
            })
          );
          return forkJoin([restoreUser$, enableProducts$]);
        }),
        tap(() => {
          this.getAccounts();
          this.getBanned();
        }),
        catchError((err) => {
          this.state.update((state) => ({
            ...state,
            bannedList: {
              ...state.bannedList,
              loading: false,
              error: err.message || 'Error al desbanear'
            }
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    withAuthRetry<void>(() =>
      this.http.post<void>(`${this.apiUrl}/admin/unban/${username}`, {}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.state.update((state) => {
          const result = state.bannedList.data.filter((a) => a.username != username)
          return {
            ...state,
            bannedList: {
              data: result,
              loading: false,
              error: null
            }
          }  
        });
        }
      }),
      catchError((err) => {
        this.state.update((state) => ({
          ...state,
          bannedList: {
            ...state.bannedList,
            loading: false,
            error: err.error?.message || 'Error al cargar las cuentas'
          }
        }));
        return of(null);
      })
    ).subscribe();
  }

  removeBannedAccount(username: string) {
    this.state.update((state) => ({
      ...state,
      bannedList: {
        ...state.bannedList,
        loading: true,
        error: null
      }
    }));

    if (isMockApi) {
      const params = new HttpParams().set('username', username);
      this.http.get<PartialAccountSchema[]>(`${Url}/banned`, { params }).pipe(
        switchMap((accounts) => {
          const user = accounts?.[0] as (PartialAccountSchema & { id?: string }) | undefined;
          if (!user || !user.id) {
            throw new Error('Usuario no encontrado');
          }
          const ownerId = user.id;
          const deleteUser$ = this.http.delete<void>(`${Url}/banned/${user.id}`);
          const deleteProducts$ = this.http.get<{ id: string }[]>(`${Url}/product?ownerId=${ownerId}`).pipe(
            switchMap((products) => {
              const deletions = products.map((p) => this.http.delete<void>(`${Url}/product/${p.id}`));
              return deletions.length ? forkJoin(deletions) : of(null);
            })
          );
          return forkJoin([deleteUser$, deleteProducts$]);
        }),
        tap(() => {
          this.getAccounts();
          this.getBanned();
        }),
        catchError((err) => {
          this.state.update((state) => ({
            ...state,
            bannedList: {
              ...state.bannedList,
              loading: false,
              error: err.message || 'Error al eliminar cuenta baneada'
            }
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    this.state.update((state) => ({
      ...state,
      bannedList: {
        ...state.bannedList,
        loading: false,
        error: 'Eliminar cuenta baneada no soportado en este backend'
      }
    }));
  }
}
