import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ERole } from '../../../enum/role';
import { AuthService } from '../../general/login/auth-managment';
import { ProductsManagmentService } from './products-managment-service';

type ProductActions = {
  load?: () => void;
  disableProduct?: (id: string) => void;
  enableProduct?: (id: string) => void;
  removeProduct?: (id: string) => void;
};

@Component({
  selector: 'app-products-managment',
  imports: [],
  templateUrl: './products-managment.html',
  styleUrl: './products-managment.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsManagment {
  protected readonly svc = inject(ProductsManagmentService);
  protected readonly auth = inject(AuthService);
  private readonly svcActions = this.svc as ProductsManagmentService & ProductActions;

  protected readonly authState = computed(() => this.auth.authState());
  protected readonly isAdmin = computed(() => this.authState().role === ERole.Admin);

  protected readonly productState = computed(() => this.svc.state().productList);
  protected readonly activeProducts = computed(() =>
    this.productState().data.filter((p) => (p as any).status !== 'blocked')
  );
  protected readonly blockedProducts = computed(() =>
    this.productState().data.filter((p) => (p as any).status === 'blocked')
  );

  constructor() {
    effect(
      () => {
        if (this.isAdmin()) {
          this.svcActions.load?.();
        }
      },
      { allowSignalWrites: true }
    );
  }

  reload(): void {
    this.svcActions.load?.();
  }

  disableProduct(id: string): void {
    this.svcActions.disableProduct?.(id);
  }

  enableProduct(id: string): void {
    this.svcActions.enableProduct?.(id);
  }

  removeProduct(id: string): void {
    this.svcActions.removeProduct?.(id);
  }
}
