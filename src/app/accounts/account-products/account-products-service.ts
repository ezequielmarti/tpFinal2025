import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, of, switchMap, tap } from 'rxjs';
import { Url, isMockApi } from '../../../common/const';
import { withAuthRetry } from '../../../helpers/http-helper';
import { PartialProductSchema } from '../../../schema/Product/product';
import { AuthService } from '../../general/login/auth-managment';
import { CreateProductSchema } from '../../../schema/Product/createProduct';

@Injectable({
  providedIn: 'root',
})
export class AccountProductService {
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  accountProductsState = signal({
    data: null as PartialProductSchema[] | null,
    loading: false,
    updateLoading: false,
    updateError: null as string | null, 
    error: null as string | null
  });

  getProductList () {
    this.accountProductsState.update(() => ({
      data: null,
      loading: true,
      updateLoading: false,
      updateError: null,
      error: null
    }));

    if (isMockApi) {
      const auth = this.authService.authState();
      const userId = auth.id;
      if (!userId) {
        this.accountProductsState.update((state) => ({
          ...state,
          loading: false,
          error: 'No se encontro la cuenta'
        }));
        return;
      }
      const params = new HttpParams().set('ownerId', userId);
      this.http.get<PartialProductSchema[]>(`${Url}/product`, { params })
        .pipe(
          tap((result) => {
            const filtered = (result || []).filter((p) => (p as any).status !== 'blocked');
            this.accountProductsState.update((state) => ({
              ...state,
              data: filtered,
              loading: false
            }));
          }),
          catchError((err) => {
            this.accountProductsState.update((state) => ({
              ...state,
              loading: false,
              error: err.error?.message || 'Error al cargar los productos'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    withAuthRetry<PartialProductSchema[]>(() =>
      this.http.get<PartialProductSchema[]>(`${this.apiUrl}`,{withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          const filtered = result.filter((p) => (p as any).status !== 'blocked');
          this.accountProductsState.update((state) => ({
          ...state,
          data: filtered,
          loading: false
        }));
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          loading: false,
          error: err.error?.message || 'Error al cargar los productos'
        }));
        return of(null);
      })
    ).subscribe();
  }

  createProduct(product: {
    title: string;
    description: string;
    category: string;
    brand: string;
    price: number;
    stock: number;
    discountPercentage?: number;
    tags?: string[];
  }) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    if (isMockApi) {
      const auth = this.authService.authState();
      const userId = auth.id;
      if (!userId) {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: 'No se encontr�� la cuenta'
        }));
        return;
      }
      const payload: CreateProductSchema & { ownerId: string; accountName?: string } = {
        title: product.title,
        description: product.description,
        category: product.category,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        discountPercentage: product.discountPercentage ?? 0,
        weight: 1,
        physical: true,
        tags: product.tags,
        ownerId: userId,
        accountName: auth.username || undefined,
      };
      this.http.post<PartialProductSchema>(`${Url}/product`, payload)
        .pipe(
          tap((result) => {
            this.accountProductsState.update((state) => ({
              ...state,
              data: [...(state.data || []), result],
              updateLoading: false,
              updateError: null
            }));
          }),
          catchError((err) => {
            this.accountProductsState.update((state) => ({
              ...state,
              updateLoading: false,
              updateError: err.error?.message || 'Error al crear producto'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    const payload: CreateProductSchema = {
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      discountPercentage: product.discountPercentage ?? 0,
      weight: 1,
      physical: true,
      tags: product.tags
    };

    withAuthRetry<PartialProductSchema>(() =>
      this.http.post<PartialProductSchema>(`${this.apiUrl}`, { product: payload }, { withCredentials: true }),
      this.authService
    ).pipe(
      tap((result) => {
        this.accountProductsState.update((state) => ({
          ...state,
          data: [...(state.data || []), result],
          updateLoading: false,
          updateError: null
        }));
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al crear producto'
        }));
        return of(null);
      })
    ).subscribe();
  }

  updateDiscount (productId: string, discount: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    if (isMockApi) {
      this.http.get<PartialProductSchema>(`${Url}/product/${productId}`)
        .pipe(
          switchMap((current) => {
            if (!current) throw new Error('Producto no encontrado');
            const payload = { ...current, discountPercentage: discount };
            return this.http.put<PartialProductSchema>(`${Url}/product/${productId}`, payload);
          }),
          tap((updated) => {
            this.accountProductsState.update((state) => {
              const newData = (state.data || []).map((d) => d.id === productId ? updated : d);
              return {
                ...state,
                data: newData,
                updateLoading: false,
                updateError: null
              };
            });
          }),
          catchError((err) => {
            this.accountProductsState.update((state) => ({
              ...state,
              updateLoading: false,
              updateError: err.error?.message || err.message || 'Error al actualizar el porcentaje de descuento'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    withAuthRetry<void>(() =>
      this.http.patch<void>(`${this.apiUrl}/discount/${productId}`, {discount}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === productId) {
                return {...d, discountPercentage: discount};
              }
              return d;
            });
            return {  
              ...state,
              data: newData,
              updateLoading: false,
              updateError: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al actualizar el porcentaje de descuento'
        }));
        return of(null);
      })
    ).subscribe();
  }

  updateStock (productId: string, delta: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    if (isMockApi) {
      this.http.get<PartialProductSchema>(`${Url}/product/${productId}`)
        .pipe(
          switchMap((current) => {
            if (!current) throw new Error('Producto no encontrado');
            const nextStock = Math.max(0, (current as any).stock + delta);
            const payload = { ...current, stock: nextStock };
            return this.http.put<PartialProductSchema>(`${Url}/product/${productId}`, payload);
          }),
          tap((updated) => {
            this.accountProductsState.update((state) => {
              const newData = (state.data || []).map((d) => d.id === productId ? updated : d);
              return {
                ...state,
                data: newData,
                updateLoading: false,
                updateError: null
              };
            });
          }),
          catchError((err) => {
            this.accountProductsState.update((state) => ({
              ...state,
              updateLoading: false,
              updateError: err.error?.message || err.message || 'Error al actualizar el stock'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    withAuthRetry<number>(() =>
      this.http.patch<number>(`${this.apiUrl}/stock/${productId}`, {delta}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: (result) => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === productId) {
                return {...d, stock: result};
              }
              return d;
            });
            return {  
              ...state,
              data: newData,
              updateLoading: false,
              updateError: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al actualizar el stock'
        }));
        return of(null);
      })
    ).subscribe();
  }

  updatePrice (productId: string, price: number) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    if (isMockApi) {
      this.http.get<PartialProductSchema>(`${Url}/product/${productId}`)
        .pipe(
          switchMap((current) => {
            if (!current) throw new Error('Producto no encontrado');
            const payload = { ...current, price };
            return this.http.put<PartialProductSchema>(`${Url}/product/${productId}`, payload);
          }),
          tap((updated) => {
            this.accountProductsState.update((state) => {
              const newData = (state.data || []).map((d) => d.id === productId ? updated : d);
              return {
                ...state,
                data: newData,
                updateLoading: false,
                updateError: null
              };
            });
          }),
          catchError((err) => {
            this.accountProductsState.update((state) => ({
              ...state,
              updateLoading: false,
              updateError: err.error?.message || err.message || 'Error al actualizar el precio'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    withAuthRetry<void>(() =>
      this.http.patch<void>(`${this.apiUrl}/price/${productId}`, {price}, {withCredentials: true}),
      this.authService
    ).pipe(
      tap({
        next: () => {
          this.accountProductsState.update((state) => {
            const newData = state.data!.map((d) => {
              if (d.id === productId) {
                return {...d, price};
              }
              return d;
            });
            return {  
              ...state,
              data: newData,
              updateLoading: false,
              updateError: null
            };
          });
        }
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al actualizar el precio'
        }));
        return of(null);
      })
    ).subscribe();
  }

  deleteProduct(productId: string) {
    this.accountProductsState.update((state) => ({
      ...state,
      updateLoading: true,
      updateError: null
    }));

    if (isMockApi) {
      this.http.delete<void>(`${Url}/product/${productId}`)
        .pipe(
          tap(() => {
            this.accountProductsState.update((state) => ({
              ...state,
              data: (state.data || []).filter((p) => p.id !== productId),
              updateLoading: false,
              updateError: null
            }));
          }),
          catchError((err) => {
            this.accountProductsState.update((state) => ({
              ...state,
              updateLoading: false,
              updateError: err.error?.message || 'Error al eliminar producto'
            }));
            return of(null);
          })
        ).subscribe();
      return;
    }

    withAuthRetry<void>(() =>
      this.http.delete<void>(`${this.apiUrl}/${productId}`, { withCredentials: true }),
      this.authService
    ).pipe(
      tap(() => {
        this.accountProductsState.update((state) => ({
          ...state,
          data: (state.data || []).filter((p) => p.id !== productId),
          updateLoading: false,
          updateError: null
        }));
      }),
      catchError((err) => {
        this.accountProductsState.update((state) => ({
          ...state,
          updateLoading: false,
          updateError: err.error?.message || 'Error al eliminar producto'
        }));
        return of(null);
      })
    ).subscribe();
  }
}
