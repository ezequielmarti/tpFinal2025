import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Url } from '../../../common/const';
import { PartialProductSchema } from '../../../schema/Product/product';

@Injectable({
  providedIn: 'root',
})
export class ProductsManagmentService {
  private apiUrl = `${Url}/product`;
  private http = inject(HttpClient);

  state = signal({
    productList:{
      data: [] as PartialProductSchema[],
      loading: false,
      error: null as string | null
    }
  });

}