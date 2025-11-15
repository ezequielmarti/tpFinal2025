import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../service/auth-managment';
import { getRoleGroup, Role } from '../../enum/role';
import { Router } from '@angular/router';
import { AccountProductService } from './account-products-service';

@Component({
  selector: 'app-account-products',
  imports: [],
  templateUrl: './account-products.html',
  styleUrl: './account-products.css',
})
export class AccountProducts {
  protected readonly authSignal = inject(AuthService);
  protected readonly productSignal = inject(AccountProductService)
  protected readonly router = inject(Router);

  getRoleGroup = getRoleGroup;
  generate = false;

  constructor() { //esto redirecciona al home si se cierra sesion
    effect(() => {

      const auth = this.authSignal.authState();

      if (!auth.logged) {
        alert('Tu sesión ha expirado o no tienes permisos. Serás redirigido al inicio.');
        this.router.navigate(['/']);
      }
    });
  }

  canSell (): boolean { // admin lo puedo sacar porque el admin no deberia entrar aca
    const auth = this.authSignal.authState()
    return auth.role !== Role.Admin && auth.role !== Role.User;
  }

  onGenerate(){
    this.generate = true;
  }

  onCancel() { //si cancelan la creacion del producto
    this.generate = false;
  }

  onSubmit() { //si el producto se crea exitosamente esta linea cambia el template del html
    this.generate = false;
  }
}
