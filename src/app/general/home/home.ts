import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeService } from './home-service';

@Component({
  selector: 'app-home',
  imports: [RouterModule, NgOptimizedImage],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly productSignal = inject(HomeService);

  protected readonly homeState = computed(() => this.productSignal.homeState());
  protected readonly featured = computed(() => this.homeState().featuredList);
  protected readonly catalog = computed(() => this.homeState().productList);
  protected readonly catalogItems = computed(() =>
    Array.from(this.catalog().data.values()).flat()
  );

  protected readonly fallbackImage = 'https://picsum.photos/seed/fallback/400';

  constructor() {
    effect(
      () => {
        this.productSignal.getTotalProducts();
        this.productSignal.getProducts();
        this.productSignal.getFeatured(4);
      },
      { allowSignalWrites: true }
    );
  }
}
