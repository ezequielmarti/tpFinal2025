import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from './cart-service';
import { CartProductSchema } from '../../../schema/cart/cart-product';

@Component({
  selector: 'app-cart',
  imports: [RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly cartState = computed(() => this.cartService.cartState());
  protected readonly items = computed<CartProductSchema[]>(() => this.cartState().data?.products ?? []);
  protected readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.amount, 0)
  );

  constructor() {
    effect(
      () => {
        this.cartService.getCart();
      },
      { allowSignalWrites: true }
    );
  }

  increase(productId: string): void {
    this.updateAmount(productId, 1);
  }

  decrease(productId: string): void {
    this.updateAmount(productId, -1);
  }

  remove(productId: string): void {
    const current = this.cartState().data;
    if (!current) return;
    const products = current.products.filter((p) => p.productId !== productId);
    this.cartService.cartState.update((state) => ({
      ...state,
      data: { ...current, products },
    }));
  }

  clear(): void {
    this.cartService.deleteCart();
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  private updateAmount(productId: string, delta: number): void {
    const current = this.cartState().data;
    if (!current) return;
    const products = current.products
      .map((p) => (p.productId === productId ? { ...p, amount: p.amount + delta } : p))
      .filter((p) => p.amount > 0);

    this.cartService.cartState.update((state) => ({
      ...state,
      data: { ...current, products },
    }));
  }
}
