import { inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, of, tap } from "rxjs";
import { Url } from "../../../common/const";
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

        if(category !== undefined){
            params = params.set('category', category);
        }

        this.categoryState.update((state) => ({
            ...state,
            loading: true,
            error: null
        }));

        this.http.get<number>(`${this.apiUrl}/total`, { params })
        .pipe(
            tap({
                next: (response) => {
                    this.categoryState.update((state) => ({
                        ...state,
                        total: response,
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

        if (limit !== undefined) {
            params = params.set('limit', limit.toString());
        }
        if (offset !== undefined) {
            params = params.set('offset', offset.toString());
        }

        this.categoryState.update((state) => ({
            ...state,
            loading: true,
            error: null
        }));

        this.http.get<PartialProductSchema[]>(`${this.apiUrl}/${category}`, { params })
        .pipe(
            tap({
                next: (response) => {
                    this.categoryState.update((state) => {
                        const newItemsMap = new Map(state.data);
                        const page = Math.floor((offset || 0) / (limit || 20)) + 1;

                        if(offset === 0) {
                            newItemsMap.clear();
                        }

                        newItemsMap.set(page, response);

                        return{
                            ...state,
                            data: newItemsMap,
                            currentCategory: category,
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
