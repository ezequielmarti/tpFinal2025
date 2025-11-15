import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CartSchema } from '../../schema/Product/product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'Averiguar el .env';
  private http = inject(HttpClient);

  cartState = signal({
    data: null as CartSchema | null,
    loading: false,
    error: null as string | null  
  });
}
