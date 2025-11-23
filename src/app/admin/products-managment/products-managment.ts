import { Component, OnInit, inject } from '@angular/core';
import { ProductsManagmentService } from './products-managment-service';
import { AuthService } from '../../general/login/auth-managment';


@Component({
  selector: 'app-products-managment',
  imports: [],
  templateUrl: './products-managment.html',
  styleUrl: './products-managment.css',
})
export class ProductsManagment implements OnInit {
  protected readonly svc = inject(ProductsManagmentService);
  protected readonly auth = inject(AuthService);

  ngOnInit(): void {

  }
}
