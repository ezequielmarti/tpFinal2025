import { Component, effect, inject, OnInit } from '@angular/core';
import { ProductUpdateService } from './product-update-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateProductSchema } from '../../../schema/Product/createProduct';
import { AuthService } from '../../general/login/auth-managment';


@Component({
  selector: 'app-product-update',
  imports: [],
  templateUrl: './product-update.html',
  styleUrl: './product-update.css',
})
export class ProductUpdate implements OnInit {
  protected readonly productSignal = inject(ProductUpdateService);
  private authSignal = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  
  id = this.route.snapshot.paramMap.get('id');
  
  private _initialized = false;
  isLogged = effect(() => {
    if(!this.authSignal.authState().logged){
      alert('Tu sesion ha expirado o no tienes permisos. Seras redirigido al inicio.');
      this.router.navigate(['/']);
    }
  });
  productGuardEffect = effect(() => {
    if (!this._initialized) {
      if (this.productSignal.productState().data !== null) {
        this._initialized = true; 
      }
      return;
    }
    if (this.productSignal.productState().data === null) {
      alert('El producto ya no existe o fue eliminado. Serás redirigido.');
      this.router.navigate(['/']);
    }
  });

  ngOnInit(): void {
    this.productSignal.getProduct(this.id!)
  }

  onSubmit(title: string, description: string, category: string, brand: string, price: number, stock: number, discount: number){
    const current = this.productSignal.productState().data;
    if (!current) return;

    const update: UpdateProductSchema & { id: string; discountPercentage?: number } = {
      id: current.id,
      title: title || current.title,
      description: description || current.description,
      category: (category as any) || current.category,
      brand: brand || current.brand,
      price: isNaN(price) ? current.price : price,
      stock: isNaN(stock) ? current.stock : stock,
      discountPercentage: isNaN(discount) ? current.discountPercentage : discount
    };

    this.productSignal.updateProduct(update as any);
  }

  onCancel() {
    this.router.navigate(['/accountProducts']);
  }
}
