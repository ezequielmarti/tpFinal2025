import { Component, inject } from '@angular/core';
import { ProductDetailsService } from './product-details-service';
import { AuthService } from '../service/auth-managment';

@Component({
  selector: 'app-product-details',
  imports: [],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  protected readonly productSignal = inject(ProductDetailsService);
  protected readonly authSignal = inject(AuthService);
}
