import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url } from '../../../common/const';
import { catchError, of, tap } from 'rxjs';
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
}
