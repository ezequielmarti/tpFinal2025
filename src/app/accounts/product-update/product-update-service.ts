import { inject, Injectable, signal } from "@angular/core";
import { Url, isMockApi } from "../../../common/const";
import { HttpClient } from "@angular/common/http";
import { catchError, of, tap, map, switchMap } from "rxjs";
import { ProductSchema } from "../../../schema/Product/product";
import { withAuthRetry } from "../../../helpers/http-helper";
import { AuthService } from "../../general/login/auth-managment";
import { UpdateProductSchema } from "../../../schema/Product/createProduct";

@Injectable({
  providedIn: 'root',
})
export class ProductUpdateService {
  
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
            error: err.error?.error || 'Error al cargar el producto'
          }));
          return of(null);
        })
      ).subscribe();
  }

  updateProduct(product: UpdateProductSchema) {
    this.productState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    if (isMockApi) {
      this.http.get<ProductSchema>(`${Url}/product/${product.id}`)
        .pipe(
          switchMap((current) => {
            const payload = {
              ...current,
              ...product,
              category: (product as any).category ?? (current as any).category,
              discountPercentage: (product as any).discountPercentage ?? (current as any).discountPercentage ?? 0
            } as Partial<ProductSchema>;
            return this.http.put<ProductSchema>(`${Url}/product/${product.id}`, payload);
          }),
          tap((result) => {
            this.productState.update(() => ({
              data: result,
              loading: false,
              error: null
            }));
            alert('Producto actualizado correctamente');
          }),
          catchError((err) => {
            this.productState.update((state) => ({
              ...state,
              loading: false,
              error: err.error?.error || "Error al actualizar producto"
            }));
            return of(null);
          })
        )
        .subscribe();
      return;
    }

    withAuthRetry<ProductSchema>(() =>
      this.http.put<ProductSchema>(`${this.apiUrl}/${product.id}`, {product}, { withCredentials: true }),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.productState.update(() => ({
              data: result,
              loading: false,
              error: null
          }));
          alert('Producto actualizado correctamente');
        }
      }),
      catchError((err) => {
        this.productState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.error || "Error al actualizar producto"
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteProduct(productId: string) {
    this.productState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}/${productId}`, { withCredentials: true }),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.productState.update(() => ({
              data: null,
              loading: false,
              error: null
          }));
        }
      }),
      catchError((err) => {
        this.productState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.error || "Error al eliminar producto"
        }));
        return of(null);
      })
    ).subscribe();
  }
}
