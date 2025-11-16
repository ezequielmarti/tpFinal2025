import { Component, inject } from '@angular/core';
import { AccountCreation } from './account-creation';
import { Router } from '@angular/router';
import { getRoleGroup, Role } from '../../../enum/role';
import { AuthService } from '../../service/auth-managment';
import { of, switchMap } from 'rxjs';

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
  Role = Role;
  accountType = null as Role | null;

  onSelectAccount (role: Role) {
    this.accountType = role;
  }

  onSubmit(){
    //aca pueden hacer un switch con getRole group y 
    //validar que sea del tipo crear el tipo de cuenta 
    // con los validate user/busines/admin que estan el 
    // schema antes de mandarlo a crear acount
    this.accountSignal.createAccount({} as any) 
    .pipe(
      switchMap((ok) => {
        if (!ok) return of(false);  // si falló, no intentar refresh
        return this.auth.refresh();
      })
    )
    .subscribe((refreshed) => {
      if (refreshed) {
        this.router.navigate(['/']);
      }
    });
    
  }
}
