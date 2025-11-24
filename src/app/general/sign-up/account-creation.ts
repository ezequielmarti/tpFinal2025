import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { Url } from "../../../common/const";
import { CreateAdminSchema, CreateBusinessSchema, CreateUserSchema } from "../../../schema/user/create-account";
import { PartialAccountSchema } from "../../../schema/user/account";
import { AuthService } from "../login/auth-managment";


@Injectable({
  providedIn: 'root',
})
export class AccountCreation {
  private apiUrl = `${Url}/account`;
  private http = inject(HttpClient);

  private authSignal = inject(AuthService);

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

  createAccount(account: CreateBusinessSchema | CreateAdminSchema | CreateUserSchema): void {
    this.creationState.update(() => ({
      loading: true,
      error: null
    }));

    this.http.post<PartialAccountSchema>(`${this.apiUrl}`, {account}, { withCredentials: true })
    .pipe(
      tap((response) => {
        this.creationState.update(() => ({
          loading: false,
          error: null
        }))

        this.authSignal.authState.update(() => ({
          logged: true,
          username: response.username,
          role: response.role,
          status: response.status,
          loading: false,
          error: null
        }))
      }),
      catchError((err) => {
        this.creationState.update(() => ({
          loading: false,
          error: err.error?.message || "Errar al crear la cuenta"
        }));
        return of(null);
      })
    ).subscribe();
  }
}