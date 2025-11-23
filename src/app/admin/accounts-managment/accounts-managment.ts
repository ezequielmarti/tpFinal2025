import { Component, OnInit, inject } from '@angular/core';
import { AccountsManagmentService } from './accounts-managment-service';
import { ERole } from '../../../enum/role';
import { AuthService } from '../../general/login/auth-managment';

@Component({
  selector: 'app-accounts-managment',
  imports: [],
  templateUrl: './accounts-managment.html',
  styleUrl: './accounts-managment.css',
})
export class AccountsManagment implements OnInit {
  protected readonly svc = inject(AccountsManagmentService);
  protected readonly auth = inject(AuthService);

  isAdmin(): boolean {
    return this.auth.authState().role === ERole.Admin;
  }

  ngOnInit(): void {
    
  }
}
