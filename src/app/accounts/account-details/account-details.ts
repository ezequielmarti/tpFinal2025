import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { AccountDetailsService } from './account-details-service';
import { Router } from '@angular/router';
import { AuthService } from '../../general/login/auth-managment';
import { ERole, getRoleGroup } from '../../../enum/role';


@Component({
  selector: 'app-account-details',
  imports: [],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class AccountDetails implements OnInit{
  protected readonly accountSignal = inject(AccountDetailsService);
  protected readonly authSignal = inject(AuthService);
  protected readonly router = inject(Router);

  getRoleGroup = getRoleGroup;
  Role = ERole;
  edit = false;
  isLogged = effect(() => {
    if(!this.authSignal.authState().logged){
      alert('Tu sesión ha expirado o no tienes permisos. Serás redirigido al inicio.');
      this.router.navigate(['/']);
    }
  })
  

  ngOnInit(): void {
    this.accountSignal.getInfo();
  }

}
