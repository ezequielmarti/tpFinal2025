import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountProductService } from './account-products-service';
import { ERole } from '../../../enum/role';
import { AuthService } from '../../general/login/auth-managment';

@Component({
  selector: 'app-account-products',
  imports: [RouterModule],
  templateUrl: './account-products.html',
  styleUrl: './account-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountProducts {
  protected readonly authSignal = inject(AuthService);
  protected readonly productSignal = inject(AccountProductService);
  protected readonly router = inject(Router);

  protected readonly generate = signal(false);
  private fetched = false;

  protected readonly authState = computed(() => this.authSignal.authState());
  protected readonly canSell = computed(() => this.authState().role === ERole.Seller);
  protected readonly noAccess = computed(() => !this.authState().logged || !this.canSell());

  constructor() {
    effect(
      () => {
        const auth = this.authState();
        if (auth.logged && this.canSell() && !this.fetched) {
          this.productSignal.getProductList();
          this.fetched = true;
        }
      },
      { allowSignalWrites: true }
    );
  }

  onGenerate(): void {
    this.generate.set(true);
  }

  onCancel(): void {
    this.generate.set(false);
  }

  onSubmit(): void {
    this.generate.set(false);
  }

  onEdit(id: string): void {
    this.router.navigate(['/productUpdate', id]);
  }
}
