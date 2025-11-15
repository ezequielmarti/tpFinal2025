import { inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, of, tap } from "rxjs";
import { Url } from "../../../common/const";
import { PartialProductSchema } from "../../../schema/Product/product";
import { Category } from "./category";

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

    // lo puedo hacer mucho mas complejo si hay tiempo y ganas
    
    private apiUrl = `${Url}/product`;
    private http = inject(HttpClient);

    categoryState = signal({ // lo mismo que arriba pero de 1 sola categoria
        data: new Map<number, PartialProductSchema[]>(), 
        total: 0, 
        loading: false,
        error: null as string | null,
        currentCategory: null as Category | null
    });

    getTotalProducts(category: Category): void {
        this.categoryState.update((state) => ({
            ...state,
            loading: true,
            error: null
        }));

        this.http.get<{total: number}>(`${this.apiUrl}/total/${category}`)
        .pipe(
            tap({
                next: (response) => {
                    this.categoryState.update((state) => ({
                        ...state,
                        total: response.total,
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

    getProductsByCategory(category: Category, limit?: number, offset?: number): void {
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

        this.http.get<{data: PartialProductSchema[]}>(`${this.apiUrl}/${category}`, { params })
        .pipe(
            tap({
                next: (response) => {
                    this.categoryState.update((state) => {
                        const newItemsMap = new Map(state.data);
                        const page = Math.floor((offset || 0) / (limit || 20)) + 1;

                        if(offset === 0) {
                            newItemsMap.clear();
                        }

                        newItemsMap.set(page, response.data);

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