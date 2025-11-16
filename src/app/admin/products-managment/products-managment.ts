import { Component, OnInit, inject } from '@angular/core';
import { ProductsManagmentService } from './products-managment-service';
import { AuthService } from '../../service/auth-managment';
import { Role } from '../../../enum/role';

@Component({
  selector: 'app-products-managment',
  imports: [],
  templateUrl: './products-managment.html',
  styleUrl: './products-managment.css',
})
export class ProductsManagment implements OnInit {
  protected readonly svc = inject(ProductsManagmentService);
  protected readonly auth = inject(AuthService);

  isAdmin(): boolean {
    return this.auth.authState().role === Role.Admin;
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.svc.load();
    }
  }
}
