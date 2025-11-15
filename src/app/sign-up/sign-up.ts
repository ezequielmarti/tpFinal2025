import { Component, inject } from '@angular/core';
import { AccountCreation } from './account-creation';
import { getRoleGroup, Role } from '../../enum/role';
import { AuthService } from '../service/auth-managment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignIn {
  private accountSignal = inject(AccountCreation);
  private auth = inject(AuthService);
  private router = inject(Router);
  
  getRoleGroup = getRoleGroup;
  accountType = null as Role | null;

  onSelectAccount (role: Role) {
    this.accountType = role;
  }
}
