import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url } from '../../common/const';
import { AuthSchema } from '../../schema/user/auth';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { Role } from '../../enum/role';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);

  authState = signal({
    logged: false,
    username: null as string | null,
    role: null as Role | null,
    loading: false,
    error: null as string | null
  });

  private setState(): void {
    this.authState.update(() => ({
      logged: false,
      username: null,
      role: null,
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

    this.http.post<{username: string, role: Role}>(`${this.apiUrl}/login`, auth, {withCredentials: true})
    .pipe(
      tap({
        next: (response) => {
          this.authState.update(() => ({
            logged: true,
            username: response.username,
            role: response.role,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((error) => {
        this.authState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error al ingresar'
        }));
        return of(null);
      })
    ).subscribe();
  }

  logOut(): void {
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
      catchError((error) => {
        this.authState.update((state) => ({
          ...state,
          loading: false,
          error: error.error?.error || 'Error en logout'
        }));
        return of(null);
      })
    ).subscribe();
  }

  refresh(): Observable<boolean> {
    this.setState();
    this.authState.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    return this.http.post<{username: string, role: Role}>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
    .pipe(
      tap((response) => {
        this.authState.update(() => ({
          logged: true,
          username: response.username,
          role: response.role,
          loading: false,
          error: null
        }));
      }),
      switchMap(() => of(true)),
      catchError((error) => {
        if(error.status !== 500){
          this.setState();
        }
        this.authState.update((state) => ({
          ...state,
          error: error.error?.error || 'Error al refrescar token'
        }));
        return of(false);
      })
    );
  }
}
