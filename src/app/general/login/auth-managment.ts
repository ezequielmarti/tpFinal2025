import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap, catchError, of, Observable, switchMap } from 'rxjs';
import { Url, isMockApi } from '../../../common/const';
import { ERole } from '../../../enum/role';
import { EStatus } from '../../../enum/status';
import { PartialAccountSchema } from '../../../schema/user/account';
import { AuthSchema } from '../../../schema/user/auth';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private apiUrl = `${Url}/auth`;
  private http = inject(HttpClient);

  authState = signal({
    logged: false,
    id: null as string | null,
    username: null as string | null,
    role: null as ERole | null,
    loading: false,
    status: null as EStatus | null,
    error: null as string | null
  });

  setState(): void {
    this.authState.update(() => ({
      logged: false,
      id: null,
      username: null,
      role: null,
      status: null,
      loading: false,
      error: null
    }));
  }

  logIn(auth: AuthSchema): void {
    this.setState();
    this.authState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    if (isMockApi) {
      const params = new HttpParams().set('username', auth.account);
      this.http.get<PartialAccountSchema[]>(`${Url}/account`, { params })
        .pipe(
          tap({
            next: (accounts) => {
              const found = accounts[0] as (PartialAccountSchema & { id?: string; password?: string });
              if (!found || (found as any).password !== auth.password) {
                this.authState.update((state) => ({
                  ...state,
                  loading: false,
                  error: 'Credenciales inválidas'
                }));
                return;
              }
              this.authState.update(() => ({
                logged: true,
                id: found.id ?? null,
                username: found.username,
                role: found.role,
                status: found.status ?? null,
                loading: false,
                error: null
              }));
            }
          }),
          catchError((err) => {
            this.authState.update((state) => ({
              ...state,
              loading: false,
              error: err.error?.message || 'Error al ingresar'
            }));
            return of(null);
          })
        )
        .subscribe();
      return;
    }

          this.http.post<PartialAccountSchema>(`${this.apiUrl}/login`, { auth }, {withCredentials: true})
    .pipe(
      tap({
        next: (response) => {
          this.authState.update(() => ({
            logged: true,
            id: response.id ?? null,
            username: response.username,
            role: response.role,
            loading: false,
            status: response.status,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.authState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al ingresar'
        }));
        return of(null);
      })
    ).subscribe();
  }

  logOut(): void {
    if (isMockApi) {
      this.setState();
      return;
    }

    this.setState();
    this.authState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    this.http.post<void>(`${this.apiUrl}/logout`, {}, {withCredentials: true})
    .pipe(
      tap({
        next: () => {
          this.setState();
        }
      }),
      catchError((err) => {
        this.authState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error en logout'
        }));
        return of(null);
      })
    ).subscribe();
  }

  refresh(): Observable<boolean> {
    if (isMockApi) {
      this.authState.update((state) => ({
        ...state,
        loading: false,
        error: null,
      }));
      return of(true);
    }

    this.setState();
    this.authState.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    return this.http.post<PartialAccountSchema>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
    .pipe(
      tap((response) => {
        this.authState.update(() => ({
          logged: true,
          id: response.id ?? null,
          username: response.username,
          role: response.role,
          status: response.status,
          loading: false,
          error: null
        }));
      }),
      switchMap(() => of(true)),
      catchError((err) => {
        if(err.status !== 500){
          this.setState();
        }
        this.authState.update((state) => ({
          ...state,
          error: err.error?.message || 'Error al refrescar token'
        }));
        return of(false);
      })
    );
  }
}
