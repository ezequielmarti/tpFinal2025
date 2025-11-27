import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url, isMockApi } from '../../../common/const';
import { PartialProductSchema } from '../../../schema/Product/product';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsManagmentService {
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);

  state = signal({
    productList:{
      data: [] as PartialProductSchema[],
      loading: false,
      error: null as string | null
    }
  });

  load(): void {
    this.state.update((state) => ({
      ...state,
      productList: { ...state.productList, loading: true, error: null }
    }));

    this.http.get<PartialProductSchema[]>(this.apiUrl)
      .pipe(
        map((data) => data.map((p) => ({ ...p, status: (p as any).status || 'active' }))),
        tap((data) => {
          this.state.update((state) => ({
            ...state,
            productList: { data, loading: false, error: null }
          }));
        }),
        catchError((err) => {
          this.state.update((state) => ({
            ...state,
            productList: { ...state.productList, loading: false, error: err.message || 'Error al cargar productos' }
          }));
          return of(null);
        })
      )
      .subscribe();
  }

  disableProduct(id: string): void {
    if (isMockApi) {
      this.http.patch(`${this.apiUrl}/${id}`, { status: 'blocked' })
        .pipe(
          tap(() => {
            this.state.update((state) => ({
              ...state,
              productList: {
                ...state.productList,
                data: state.productList.data.map((p) => p.id === id ? { ...p, status: 'blocked' as any } : p)
              }
            }));
          }),
          catchError(() => of(null))
        ).subscribe();
      return;
    }
  }

  enableProduct(id: string): void {
    if (isMockApi) {
      this.http.patch(`${this.apiUrl}/${id}`, { status: 'active' })
        .pipe(
          tap(() => {
            this.state.update((state) => ({
              ...state,
              productList: {
                ...state.productList,
                data: state.productList.data.map((p) => p.id === id ? { ...p, status: 'active' as any } : p)
              }
            }));
          }),
          catchError(() => of(null))
        ).subscribe();
      return;
    }
  }

  removeProduct(id: string): void {
    if (isMockApi) {
      this.http.delete(`${this.apiUrl}/${id}`)
        .pipe(
          tap(() => {
            this.state.update((state) => ({
              ...state,
              productList: {
                ...state.productList,
                data: state.productList.data.filter((p) => p.id !== id)
              }
            }));
          }),
          catchError(() => of(null))
        ).subscribe();
      return;
    }
  }
}
