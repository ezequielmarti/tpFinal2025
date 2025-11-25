import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SearchService } from './search-service';

@Component({
  selector: 'app-search',
  imports: [RouterModule, NgOptimizedImage],
  templateUrl: './search.html',
  styleUrl: './search.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Search {
  protected readonly searchSignal = inject(SearchService);
  private readonly route = inject(ActivatedRoute);

  protected readonly fallbackImage = 'https://picsum.photos/seed/fallback/400';

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap
  });
  private readonly lastQuery = signal<string>('');

  readonly searchQuery = computed(() => (this.queryParams().get('q') ?? '').trim());

  constructor() {
    effect(() => {
      const q = this.searchQuery();
      if (!q || q === this.lastQuery()) {
        return;
      }
      this.lastQuery.set(q);
      this.searchSignal.search(q);
    });
  }
}
