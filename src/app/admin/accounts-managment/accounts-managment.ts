import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { AccountsManagmentService } from './accounts-managment-service';
import { ERole } from '../../../enum/role';
import { AuthService } from '../../general/login/auth-managment';

@Component({
  selector: 'app-accounts-managment',
  imports: [],
  templateUrl: './accounts-managment.html',
  styleUrl: './accounts-managment.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsManagment {
  protected readonly svc = inject(AccountsManagmentService);
  protected readonly auth = inject(AuthService);

  protected readonly authState = computed(() => this.auth.authState());
  protected readonly isAdmin = computed(() => this.authState().role === ERole.Admin);

  protected readonly accountList = computed(() => this.svc.state().accountList);
  protected readonly bannedList = computed(() => this.svc.state().bannedList);

  constructor() {
    effect(
      () => {
        if (this.isAdmin()) {
          this.reload();
        }
      },
      { allowSignalWrites: true }
    );
  }

  reload(): void {
    this.svc.getAccounts();
    this.svc.getBanned();
  }

  ban(username: string): void {
    if (!username || !this.isAdmin()) return;
    this.svc.banAccount(username);
  }

  unban(username: string): void {
    if (!username || !this.isAdmin()) return;
    this.svc.unbanAccount(username);
  }

  removeBanned(username: string): void {
    if (!username || !this.isAdmin()) return;
    this.svc.removeBannedAccount(username);
  }
}
