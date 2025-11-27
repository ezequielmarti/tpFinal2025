import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { Url, isMockApi } from "../../../common/const";
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

        const totalUrl = isMockApi ? `${this.apiUrl}` : `${this.apiUrl}/total`;

        this.http.get<PartialProductSchema[] | number>(totalUrl)
        .pipe(
            tap({
                next: (response) => {
                    const total = Array.isArray(response) ? response.length : response;
                    this.homeState.update((state) => ({
                        ...state,
                        productList: {
                            ...state.productList,
                            total,
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
                    const filtered = response.filter((p) => (p as any).status !== 'blocked');
                    this.homeState.update((state) => {
                        const newItemsMap = new Map(state.productList.data);
                        const page = Math.floor((offset || 0) / (limit || 20)) + 1;

                        if(offset === 0) {
                            newItemsMap.clear();
                        }

                        newItemsMap.set(page, filtered);

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
                    const filtered = response.filter((p) => (p as any).status !== 'blocked');
                    this.homeState.update((state) => ({
                        ...state,
                        featuredList: {
                            ...state.featuredList,
                            data: this.pickRandom(filtered, 4),
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

    private pickRandom(list: PartialProductSchema[], count: number): PartialProductSchema[] {
        if (!list || !list.length) return [];
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
}
