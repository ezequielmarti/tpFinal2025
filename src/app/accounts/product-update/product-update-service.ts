import { inject, Injectable, signal } from "@angular/core";
import { Url } from "../../../common/const";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../service/auth-managment";
import { UpdateProduct } from "../../../schema/Product/createProduct";
import { catchError, of, tap, map } from "rxjs";
import { ProductSchema } from "../../../schema/Product/product";
import { withAuthRetry } from "../../../helpers/http-helper";

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

    // Modo mock/local: leer de db.json para evitar errores de parse cuando Url está vacío
    if (!Url) {
      this.http.get<{ products: any[] }>('/mock/db.json')
        .pipe(
          map(res => res.products.find(p => p.id === productId)),
          tap((product) => {
            if (!product) {
              this.productState.update(() => ({
                data: null,
                loading: false,
                error: 'Producto no encontrado (mock)'
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
              error: err.error?.error || 'Error al cargar el producto (mock)'
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

  updateProduct(product: UpdateProduct) {
    this.productState.update((state) => ({
      ...state,
      loading: true,
      error: null
    }));

    if (!Url) {
      this.productState.update((state) => {
        const merged = state.data ? { ...state.data, ...product } : null;
        return {
          data: merged,
          loading: false,
          error: null
        };
      });
      return;
    }

    withAuthRetry<ProductSchema>(() =>
      this.http.put<ProductSchema>(`${this.apiUrl}`, product, { withCredentials: true }),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.productState.update(() => ({
              data: result,
              loading: false,
              error: null
          }));
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
}
