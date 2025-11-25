import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ERole, getRoleGroup } from '../../../enum/role';
import { AccountDetailsService } from './account-details-service';
import { AuthService } from '../../general/login/auth-managment';

@Component({
  selector: 'app-account-details',
  imports: [],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDetails {
  protected readonly accountSignal = inject(AccountDetailsService);
  protected readonly authSignal = inject(AuthService);
  protected readonly router = inject(Router);

  readonly getRoleGroup = getRoleGroup;
  readonly Role = ERole;
  readonly edit = signal(false);

  protected readonly authState = computed(() => this.authSignal.authState());
  protected readonly accountState = computed(() => this.accountSignal.accountState());

  private fetched = false;

  constructor() {
    effect(
      () => {
        const auth = this.authState();
        if (!auth.logged) {
          this.router.navigate(['/']);
          return;
        }
        if (!this.fetched) {
          this.accountSignal.getInfo();
          this.fetched = true;
        }
      },
      { allowSignalWrites: true }
    );
  }

  onEditToggle(active: boolean): void {
    this.edit.set(active);
  }
}
