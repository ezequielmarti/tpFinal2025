import { Component, inject } from '@angular/core';
import { AccountCreation } from './account-creation';
import { Router } from '@angular/router';
import { ERole, getRoleGroup } from '../../../enum/role';
import { AuthService } from '../login/auth-managment';


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
  Role = ERole;
  accountType = null as ERole | null;

  onSelectAccount (role: ERole) {
    this.accountType = role;
  }

  onSubmit(){
    
    //el resultado lo mandas a la funcion de abajo, 
    //no importa el que tipo de cuenta sea mientras cumpla con las condiciones.
    
    const newAccount = /*aca el resultado del forms*/ as CreateBusinessSchema | CreateAdminSchema | CreateUserSchema;
    this.accountSignal.createAccount(newAccount);
  }
}
