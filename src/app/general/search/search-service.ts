import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { Url } from "../../../common/const";
import { PartialProductSchema } from "../../../schema/Product/product";
import { catchError, map, of, tap } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class SearchService {
    private apiUrl = `${Url}/product`;
    private http = inject(HttpClient);

    searchState = signal({ //se puede modificar para tambien buscar empresas/usuarios.
        data: [] as PartialProductSchema[], 
        loading: false,
        error: null as string | null 
    });

    search(contain: string): void {
        this.searchState.update((state) => ({
            ...state,
            loading: true,
            error: null
        }));
        
        if (!Url) {
          this.http.get<{ products: PartialProductSchema[] }>('/mock/db.json')
          .pipe(
            map((res) => {
              const term = contain.toLowerCase();
              return res.products.filter(p =>
                p.title.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term) ||
                p.brand.toLowerCase().includes(term) ||
                p.tags?.some(t => t.toLowerCase().includes(term))
              );
            }),
            tap((data) => {
              this.searchState.update(() => ({
                data,
                loading: false,
                error: null
              }));
            }),
            catchError((err) => {
              this.searchState.update((state) => ({
                  data: [],
                  loading: false,
                  error: err.error?.error || 'Error en la busqueda'
              }));
              return of(null);
            })
          ).subscribe();
          return;
        }

        this.http.post<{data: PartialProductSchema[]}>(`${this.apiUrl}/search`, {contain})
        .pipe(
            tap({
                next: (response) => {
                    this.searchState.update(() => ({
                        data: response.data,
                        loading: false,
                        error: null
                    }));
                }
            }),
            catchError((err) => {
                this.searchState.update((state) => ({
                    data: [],
                    loading: false,
                    error: err.error?.error || 'Error en la busqueda'
                }));
                return of(null);
            })
        ).subscribe();
    }
}
