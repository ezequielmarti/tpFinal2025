import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { catchError, Observable, of, switchMap, tap, throwError } from "rxjs";
import { Url } from "../../../common/const";
import { CreateBusiness, CreateAdmin, CreateUser } from "../../../schema/user/create-account";

@Injectable({
  providedIn: 'root',
})
export class AccountCreation {
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);

  creationState = signal({
    loading: false,
    error: null as string | null
  });

  resetState() {
    this.creationState.set({
      loading: false,
      error: null
    });
  }

  createAccount(account: CreateBusiness | CreateAdmin | CreateUser): Observable<boolean> {
    this.creationState.update(() => ({
      loading: true,
      error: null
    }));

    return this.http.post<void>(`${this.apiUrl}`, account, { withCredentials: true })
    .pipe(
      tap(() => {
        this.creationState.update(() => ({
          loading: false,
          error: null
        }));
      }),
      switchMap(() => of(true)),
      catchError((err) => {
        this.creationState.update(() => ({
          loading: false,
          error: err.error?.error || "Errar al crear la cuenta"
        }));
        return of(false);
      })
    );
  }
}