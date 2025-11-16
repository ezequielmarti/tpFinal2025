import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, distinctUntilChanged, Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { SearchService } from './search-service';

@Component({
  selector: 'app-search',
  imports: [RouterModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Search implements OnInit, OnDestroy {
  protected readonly searchSignal = inject(SearchService);
  private route = inject(ActivatedRoute);
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.route.queryParamMap
      .pipe(
        map(params => params.get('q')?.trim() || ''),
        distinctUntilChanged(),
        filter(q => !!q)
      )
      .subscribe((q) => {
        this.searchSignal.search(q);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
