import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductDetailsService } from './product-details-service';
import { AuthService } from '../../service/auth-managment';
import { getRoleGroup } from '../../../enum/role';

@Component({
  selector: 'app-product-details',
  imports: [RouterModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  protected readonly productSignal = inject(ProductDetailsService);
  protected readonly authSignal = inject(AuthService);
  private route = inject(ActivatedRoute);
  getRoleGroup = getRoleGroup;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productSignal.getProduct(id);
    }
  }

  isOwner(): boolean {
    const auth = this.authSignal.authState();
    const prod = this.productSignal.productState().data;
    if (!auth.logged || !prod) return false;
    // El backend no expone ownerId en el schema, usamos el accountName como identificador visible
    return !!(auth.username && prod.accountName && prod.accountName.toLowerCase() === auth.username.toLowerCase());
  }
}
