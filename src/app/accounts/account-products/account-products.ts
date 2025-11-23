import { Component, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountProductService } from './account-products-service';
import { getRoleGroup, ERole } from '../../../enum/role';
import { AuthService } from '../../general/login/auth-managment';


@Component({
  selector: 'app-account-products',
  imports: [RouterModule],
  templateUrl: './account-products.html',
  styleUrl: './account-products.css',
})
export class AccountProducts {
  protected readonly authSignal = inject(AuthService);
  protected readonly productSignal = inject(AccountProductService);
  protected readonly router = inject(Router);

  getRoleGroup = getRoleGroup;
  generate = false;
  private fetched = false;

  constructor() { // esto redirecciona al home si se cierra sesion
    effect(() => {
      const auth = this.authSignal.authState();

      if (auth.logged && this.canSell() && !this.fetched) {
        this.productSignal.getProductList();
        this.fetched = true;
      }
    });
  }

  canSell(): boolean { // admin lo puedo sacar porque el admin no deberia entrar aca
    const auth = this.authSignal.authState();
    return auth.role === ERole.Seller;
  }

  onGenerate() {
    this.generate = true;
  }

  onCancel() { // si cancelan la creacion del producto
    this.generate = false;
  }

  onSubmit() { // si el producto se crea exitosamente esta linea cambia el template del html
    this.generate = false;
  }

  onEdit(id: string) {
    this.router.navigate(['/productUpdate', id]);
  }

  noAccess(): boolean {
    const auth = this.authSignal.authState();
    return !auth.logged || !this.canSell();
  }
}
