import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { Url } from "../../../common/const";
import { PartialProductSchema } from "../../../schema/Product/product";
import { catchError, of, tap } from "rxjs";

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
    let params = new HttpParams();

    params = params.set('contain', contain);
    
    this.searchState.update((state) => ({
        ...state,
        loading: true,
        error: null
    }));

    this.http.get<PartialProductSchema[]>(`${this.apiUrl}/search`, { params }) 
    .pipe(
        tap({
            next: (response) => {
                this.searchState.update(() => ({
                    data: response,
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
