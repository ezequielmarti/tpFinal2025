import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { tap, catchError, of, map } from "rxjs";
import { Url } from "../../../common/const";
import { CreateReview } from "../../../schema/Product/createReview";
import { ProductSchema } from "../../../schema/Product/product";
import { AuthService } from "../../service/auth-managment";

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

    if (!Url) {
      this.http.get<{ products: any[] }>('/mock/db.json')
      .pipe(
        map(res => res.products.find(p => p.id === productId)),
        tap((product) => {
          if (!product) {
            this.productState.update(() => ({
              data: null,
              loading: false,
              error: 'Producto no encontrado'
            }));
            return;
          }
          this.productState.update(() => ({
            data: product as ProductSchema,
            loading: false,
            error: null
          }));
        }),
        catchError((err) => {
          this.productState.update(() => ({
            data: null,
            loading: false,
            error: err.error?.error || 'Error al cargar el producto'
          }));
          return of(null);
        })
      ).subscribe();
      return;
    }

    this.http.get<{data: ProductSchema}>(`${this.apiUrl}/${productId}`)
      .pipe(
        tap({
          next: (response) => {
            this.productState.update(() => ({
              data: response.data,
              loading: false,
              error: null
            }));
          }
        }),
        catchError((err) => {
          this.productState.update(() => ({
            data: null,
            loading: false,
            error: err.error?.error || 'Error al cargar el producto'
          }));
          return of(null);
        })
      ).subscribe();
  }

  createReview(review: CreateReview): void {
    this.productState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    this.http.post<{data: ProductSchema}>(`${this.apiUrl}/review`, {body: review}, {withCredentials: true})
    .pipe(
      tap({
        next: (response) => {
          this.productState.update(() => ({
            data: response.data,
            loading: false,
            error: null
          }));
        }
      }),
      catchError((err) => {
        this.productState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.error || 'Error al crear la reseña'
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

    this.http.delete<void>(`${this.apiUrl}/review/${productId}`, {withCredentials: true})
    .pipe(
      tap({
        next: () => {
          this.productState.update((state) => {
            const reviews = state.data?.reviews?.filter((e) => e.username !== this.authService.authState().username);
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
          error: err.error?.error || 'Error eliminar la reseña'
        }));
        return of(null);
      })
    ).subscribe();
  }
}
