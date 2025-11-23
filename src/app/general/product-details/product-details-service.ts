import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { tap, catchError, of } from "rxjs";
import { Url } from "../../../common/const";
import { ProductSchema, ReviewSchema } from "../../../schema/Product/product";
import { withAuthRetry } from "../../../helpers/http-helper";
import { CreateReviewSchema } from "../../../schema/Product/createReview";
import { AuthService } from "../login/auth-managment";

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  productState = signal({
    data: null as ProductSchema | null,
    loading: false,
    error: null as string | null
  });

  getProduct(productId: string): void {
    this.productState.update(() => ({
      data: null,
      loading: true,
      error: null
    }));

    this.http.get<ProductSchema>(`${this.apiUrl}/${productId}`)
    .pipe(
      tap({
        next: (response) => {
          this.productState.update(() => ({
            data: response,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.productState.update(() => ({
          data: null,
          loading: false,
          error: err.error?.message || 'Error al cargar el producto'
        }));
        return of(null);
      })
    ).subscribe();
  }

  createReview(review: CreateReviewSchema): void {
    this.productState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<ReviewSchema[]>(() =>
      this.http.post<ReviewSchema[]>(`${this.apiUrl}/review`, {review}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (response) => {
          this.productState.update((state) => {
            const newData = state.data;
            newData!.reviews = response;
            return{
              data: newData,
              loading: false,
              error: null
            };
          });
        }
      }),
      catchError((err) => {
        this.productState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al crear la reseña'
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteReview(productId: string): void {
    this.productState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));
    const username = this.authService.authState().username;
    
    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}/review/${productId}`, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.productState.update((state) => {
            const reviews = state.data?.reviews?.filter((e) => e.username !== username);
            const newData = state.data ? { ...state.data, reviews } : state.data;
            
            return {
              data: newData,
              loading: false,
              error: null
            }
          });
        }
      }),
      catchError((err) => {
        this.productState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error eliminar la resena'
        }));
        return of(null);
      })
    ).subscribe();
  }
}
