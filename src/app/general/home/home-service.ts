import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { Url } from "../../../common/const";
import { PartialProductSchema } from "../../../schema/Product/product";

@Injectable({
  providedIn: 'root',
})
export class HomeService {
    private apiUrl = `${Url}/product`;
    private http = inject(HttpClient);

    homeState = signal({
        productList: { // señal que guarda una lista de productos(es un map porque va cargando por paginas)
            data: new Map<number, PartialProductSchema[]>(), 
            total: 0, 
            loading: false,
            error: null as string | null 
        },
        featuredList: { // almacena una lista de prod destacados(pueden ser mejor rankeados o algo asi)
            data: [] as PartialProductSchema[], 
            loading: false,
            error: null as string | null 
        }
    });

    getTotalProducts(): void {
        this.homeState.update((state) => ({
            ...state,
            productList: {
                ...state.productList,
                loading: true,
                error: null
            }
        }));

        this.http.get<number>(`${this.apiUrl}/total`)
        .pipe(
            tap({
                next: (response) => {
                    this.homeState.update((state) => ({
                        ...state,
                        productList: {
                            ...state.productList,
                            total: response,
                            loading: false,
                            error: null
                        }
                    }));
                }
            }),
            catchError((err) => {
                this.homeState.update((state) => ({
                    ...state,
                    productList: {
                        ...state.productList,
                        loading: false,
                        error: err.error?.message || 'Error al cargar productos'
                    }
                }));
                return of(null);
            })
        ).subscribe();
    }

    getProducts(limit?: number, offset?: number): void {
        let params = new HttpParams();

        if (limit !== undefined) {
            params = params.set('limit', limit.toString());
        }
        if (offset !== undefined) {
            params = params.set('offset', offset.toString());
        }

        this.homeState.update((state) => ({
            ...state,
            productList: {
                ...state.productList,
                loading: true,
                error: null
            }
        }));

        this.http.get<PartialProductSchema[]>(`${this.apiUrl}`, { params })
        .pipe(
            tap({
                next: (response) => {
                    this.homeState.update((state) => {
                        const newItemsMap = new Map(state.productList.data);
                        const page = Math.floor((offset || 0) / (limit || 20)) + 1;

                        if(offset === 0) {
                            newItemsMap.clear();
                        }

                        newItemsMap.set(page, response);

                        return{
                            ...state,
                            productList: {
                                ...state.productList,
                                data: newItemsMap,
                                loading: false,
                                error: null
                            }
                        };
                    });
                }
            }),
            catchError((err) => {
                this.homeState.update((state) => ({
                    ...state,
                    productList: {
                        ...state.productList,
                        loading: false,
                        error: err.error?.message || 'Error al cargar productos'
                    }
                }));
                return of(null);
            })
        ).subscribe();
    }

    getFeatured(limit?: number, offset?: number): void {
        let params = new HttpParams();

        if (limit !== undefined) {
            params = params.set('limit', limit.toString());
        }
        if (offset !== undefined) {
            params = params.set('offset', offset.toString());
        }

        this.homeState.update((state) => ({
            ...state,
            featuredList: {
                ...state.featuredList,
                loading: true,
                error: null
            }
        }));

        this.http.get<PartialProductSchema[]>(`${this.apiUrl}`, { params })
        .pipe(
            tap({
                next: (response) => {
                    this.homeState.update((state) => ({
                        ...state,
                        featuredList: {
                            ...state.featuredList,
                            data: response,
                            loading: false,
                            error: null
                        }                       
                    }));
                }
            }),
            catchError((err) => {
                this.homeState.update((state) => ({
                    ...state,
                    featuredList: {
                        ...state.featuredList,
                        loading: false,
                        error: err.error?.message || 'Error al cargar productos destacados'
                    }
                }));
                return of(null);
            })
        ).subscribe();
    }
}