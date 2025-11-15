import { Component, inject } from '@angular/core';
import { getRoleGroup } from '../../enum/role';
import { AuthService } from '../service/auth-managment';

@Component({
  selector: 'app-account-menu',
  imports: [],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.css',
})
export class AccountMenu {
  protected readonly authSignal = inject(AuthService);
  getRoleGroup = getRoleGroup;

}
