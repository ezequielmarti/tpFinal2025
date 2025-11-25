import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { CategoryService } from './category-service';
import { PartialProductSchema } from '../../../schema/Product/product';

type SortType = 'default' | 'priceAsc' | 'priceDesc' | 'discountDesc' | 'discountAsc';

@Component({
  selector: 'app-category',
  imports: [RouterModule, NgOptimizedImage],
  templateUrl: './category.html',
  styleUrl: './category.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Category {
  protected readonly categorySignal = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);

  filters = signal({
    tag: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    minDiscount: null as number | null,
    sort: 'default' as SortType
  });
  sortOpen = signal(false);
  readonly sortOptions: { value: SortType; label: string }[] = [
    { value: 'default', label: 'Relevancia' },
    { value: 'priceAsc', label: 'Precio: menor a mayor' },
    { value: 'priceDesc', label: 'Precio: mayor a menor' },
    { value: 'discountDesc', label: 'Mayor descuento' },
    { value: 'discountAsc', label: 'Menor descuento' },
  ];

  sortLabel = computed(() => {
    const current = this.filters().sort;
    return this.sortOptions.find(o => o.value === current)?.label || 'Relevancia';
  });

  products = computed<PartialProductSchema[]>(() => {
    const pages = Array.from(this.categorySignal.categoryState().data.values());
    return pages.flat();
  });

  filteredProducts = computed<PartialProductSchema[]>(() => {
    const f = this.filters();
    let list = this.products();

    if (f.tag.trim()) {
      const tag = f.tag.trim().toLowerCase();
      list = list.filter(p => p.tags?.some(t => t.toLowerCase().includes(tag)));
    }
    if (f.minPrice !== null) {
      list = list.filter(p => p.price >= f.minPrice!);
    }
    if (f.maxPrice !== null) {
      list = list.filter(p => p.price <= f.maxPrice!);
    }
    if (f.minDiscount !== null) {
      list = list.filter(p => (p.discountPercentage || 0) >= f.minDiscount!);
    }

    if (f.sort === 'priceAsc') {
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (f.sort === 'priceDesc') {
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (f.sort === 'discountDesc') {
      list = [...list].sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (f.sort === 'discountAsc') {
      list = [...list].sort((a, b) => (a.discountPercentage || 0) - (b.discountPercentage || 0));
    }

    return list;
  });

  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  protected readonly fallbackImage = 'https://picsum.photos/seed/fallback/400';

  constructor() {
    effect(
      () => {
        const id = this.params().get('id') || '';
        this.categorySignal.getTotalProducts(id);
        this.categorySignal.getProductsByCategory(id);
      },
      { allowSignalWrites: true }
    );
  }

  onFilterChange(key: 'tag' | 'minPrice' | 'maxPrice' | 'minDiscount' | 'sort', value: string) {
    this.filters.update((f) => {
      if (key === 'sort') {
        return { ...f, sort: (value as any) || 'default' };
      }

      if (key === 'tag') {
        return { ...f, tag: value };
      }

      const parsed = value === '' ? null : Number(value);
      return { ...f, [key]: isNaN(parsed as number) ? null : parsed } as typeof f;
    });
    if (key === 'sort') {
      this.sortOpen.set(false);
    }
  }

  clearFilters() {
    this.filters.set({
      tag: '',
      minPrice: null,
      maxPrice: null,
      minDiscount: null,
      sort: 'default'
    });
  }

  toggleSort() {
    this.sortOpen.update((v) => !v);
  }

  selectSort(value: SortType) {
    this.onFilterChange('sort', value);
    this.sortOpen.set(false);
  }
}
