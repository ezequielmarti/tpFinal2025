import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { Url, isMockApi } from "../../../common/const";
import { PartialProductSchema } from "../../../schema/Product/product";
import { catchError, of, tap, map } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);

  searchState = signal({ // tiene un limite de respuewstas establecido en el back (ponele 50).
      data: [] as PartialProductSchema[], 
      loading: false,
      error: null as string | null 
  });

  search(contain: string): void {
    const term = (contain || '').trim();
    let params = new HttpParams();
    params = params.set('contain', term);

    this.searchState.update((state) => ({
        ...state,
        loading: true,
        error: null
    }));

    if (isMockApi) {
      this.http.get<PartialProductSchema[]>(`${this.apiUrl}`)
        .pipe(
          map((items) => {
            const lowered = term.toLowerCase();
            return (items || []).filter((p) => {
              if ((p as any).status === 'blocked') return false;
              const haystack = [
                p.title,
                p.description,
                p.brand,
                (p as any).category,
                ...(p.tags || []),
              ].filter(Boolean).map((v) => String(v).toLowerCase());
              return haystack.some((v) => v.includes(lowered));
            });
          }),
          tap((filtered) => {
            this.searchState.update(() => ({
              data: filtered,
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

    this.http.get<PartialProductSchema[]>(`${this.apiUrl}/search`, { params }) 
      .pipe(
        tap({
            next: (response) => {
                this.searchState.update(() => ({
                    data: response.filter((p) => (p as any).status !== 'blocked'),
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
