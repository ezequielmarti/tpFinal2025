import { inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, of, tap } from "rxjs";
import { Url, isMockApi } from "../../../common/const";
import { PartialProductSchema } from "../../../schema/Product/product";

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
    
    private apiUrl = `${Url}/product`;
    private http = inject(HttpClient);

    categoryState = signal({
        data: new Map<number, PartialProductSchema[]>(),
        total: 0,
        loading: false,
        error: null as string | null,
        currentCategory: null as string | null
    });

    getTotalProducts(category: string): void {
        let params = new HttpParams();
        const normalizedCategory = category === 'all' ? undefined : category;

        if (normalizedCategory !== undefined) {
            params = params.set('category', normalizedCategory);
        }

        this.categoryState.update((state) => ({
            ...state,
            loading: true,
            error: null
        }));

        const totalUrl = isMockApi ? `${this.apiUrl}` : `${this.apiUrl}/total`;

        this.http.get<number | PartialProductSchema[]>(totalUrl, { params })
        .pipe(
            tap({
                next: (response) => {
                    const total = Array.isArray(response) ? response.length : response;
                    this.categoryState.update((state) => ({
                        ...state,
                        total,
                        loading: false,
                        error: null
                        
                    }));
                }
            }),
            catchError((err) => {
                this.categoryState.update((state) => ({
                    ...state,
                    loading: false,
                    error: err.error?.error || 'Error al cargar los productos de la categoria'                    
                }));
                return of(null);
            })
        ).subscribe();
    }

    getProductsByCategory(category: string, limit?: number, offset?: number): void {
        let params = new HttpParams();
        const normalizedCategory = category === 'all' ? undefined : category;

        if (limit !== undefined) {
            params = params.set('limit', limit.toString());
        }
        if (offset !== undefined) {
            params = params.set('offset', offset.toString());
        }
        if (isMockApi && normalizedCategory) {
            params = params.set('category', normalizedCategory);
        }

        this.categoryState.update((state) => ({
            ...state,
            loading: true,
            error: null
        }));

        const listUrl = isMockApi || normalizedCategory === undefined
          ? `${this.apiUrl}`
          : `${this.apiUrl}/${normalizedCategory}`;

        this.http.get<PartialProductSchema[]>(listUrl, { params })
        .pipe(
            tap({
                next: (response) => {
                    const filtered = response.filter((p) => (p as any).status !== 'blocked');
                    this.categoryState.update((state) => {
                        const newItemsMap = new Map(state.data);
                        const page = Math.floor((offset || 0) / (limit || 20)) + 1;

                        if(offset === 0) {
                            newItemsMap.clear();
                        }

                        newItemsMap.set(page, filtered);

                        return{
                            ...state,
                            data: newItemsMap,
                            currentCategory: normalizedCategory || null,
                            loading: false,
                            error: null
                        };
                    });
                }
            }),
            catchError((err) => {
                this.categoryState.update((state) => ({
                    ...state,
                    loading: false,
                    error: err.error?.error || 'Error al cargar productos'
                }));
                return of(null);
            })
        ).subscribe();
    }
}
