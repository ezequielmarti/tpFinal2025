import { Component, OnInit, inject } from '@angular/core';
import { AccountsManagmentService } from './accounts-managment-service';
import { AuthService } from '../../service/auth-managment';
import { Role } from '../../../enum/role';

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
    return this.auth.authState().role === Role.Admin;
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.svc.load();
    }
  }
}
