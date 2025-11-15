import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { Url } from "../../common/const";
import { CreateAdmin, CreateBusiness, CreateUser } from "../../schema/user/create-account";
import { catchError, Observable, of, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AccountCreation {
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);

  creationState = signal({
    loading: false,
    error: [] as string[]
  });

  resetState() {
    this.creationState.set({
      loading: false,
      error: []
    });
  }

  createAccount(account: CreateBusiness | CreateAdmin | CreateUser) {
    this.creationState.update(() => ({
      loading: true,
      error: []
    }));

    this.http.post<void>(`${this.apiUrl}`, account, { withCredentials: true })
    .pipe(
      tap({
        next: () => {
          this.creationState.update(() => ({
            loading: false,
            error: []
          }));
        }
      }),
      catchError((err) => {
        const errors: string[] = [];
        
        if (Array.isArray(err.error)) {
          for (const e of err.error) {
            if (e.constraints) {
              errors.push(...Object.values(e.constraints));
            }
          }
        } else if (err.error?.error) {
          errors.push(err.error.error);
        } else {
          errors.push("Error desconocido al registrar");
        }

        this.creationState.update(() => ({
          loading: false,
          error: errors
        }));
        return of(null);
      })
    ).subscribe();
  }
}