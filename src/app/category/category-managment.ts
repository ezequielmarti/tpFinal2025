import { inject, Injectable, signal } from "@angular/core";
import { PartialProductSchema } from "../../schema/Product/product";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Url } from "../../common/const";
import { catchError, of, tap } from "rxjs";
import { Category } from "../../enum/category";

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

    getTotalProducts(): void {
        this.categoryState.update((state) => ({
            ...state,
            loading: true,
            error: null
        }));

        this.http.get<{total: number}>(`${this.apiUrl}/total`)
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
            catchError((error) => {
                this.categoryState.update((state) => ({
                    ...state,
                    loading: false,
                    error: error.error?.error || 'Error al cargar los productos de la categoria'                    
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
            catchError((error) => {
                this.categoryState.update((state) => ({
                    ...state,
                    loading: false,
                    error: error.error?.error || 'Error al cargar productos'
                }));
                return of(null);
            })
        ).subscribe();
    }
}