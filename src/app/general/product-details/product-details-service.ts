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
      this.http.get<{ users: any[]; products: any[] }>('/mock/db.json')
        .pipe(
          tap((res) => {
            const prod: any = res.products.find(p => p.id === productId);
            if (!prod) {
              this.productState.update(() => ({
                data: null,
                loading: false,
                error: 'Producto no encontrado'
              }));
              return;
            }
            const owner = res.users.find(u => u.id === prod.ownerId);
            const merged = {
              ...prod,
              accountName: owner?.username || prod.accountName || '',
              contactEmail: owner?.email || prod.contactEmail || '',
              contactPhone: owner?.phone || prod.contactPhone || ''
            };
            this.productState.update(() => ({
              data: merged as ProductSchema,
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

    if (!Url) {
      this.productState.update((state) => {
        const existing = state.data?.reviews || [];
        const newReview = { ...review, username: this.authService.authState().username || 'anon', date: new Date() } as any;
        const reviews = [...existing.filter(r => r.username !== newReview.username), newReview];
        const data = state.data ? { ...state.data, reviews } : state.data;
        return { data, loading: false, error: null };
      });
      return;
    }

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
          error: err.error?.error || 'Error al crear la resena'
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

    if (!Url) {
      this.productState.update((state) => {
        const reviews = state.data?.reviews?.filter((e) => e.username !== username);
        const newData = state.data ? { ...state.data, reviews } : state.data;
        return {
          data: newData,
          loading: false,
          error: null
        };
      });
      return;
    }

    this.http.delete<void>(`${this.apiUrl}/review/${productId}`, {withCredentials: true})
      .pipe(
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
            error: err.error?.error || 'Error eliminar la resena'
          }));
          return of(null);
        })
      ).subscribe();
  }
}
