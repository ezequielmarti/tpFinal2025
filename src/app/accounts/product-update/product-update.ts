import { Component, effect, inject, OnInit } from '@angular/core';
import { ProductUpdateService } from './product-update-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth-managment';

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
  isLogged = effect(() => {
    if(!this.authSignal.authState().logged){
      alert('Tu sesión ha expirado o no tienes permisos. Serás redirigido al inicio.');
      this.router.navigate(['/']);
    }
  })

  ngOnInit(): void {
    this.productSignal.getProduct(this.id!)
  }

  onSubmit(){

    this.productSignal.updateProduct()
  }
}
