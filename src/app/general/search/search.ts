import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SearchService } from './search-service';

@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.html',
  styleUrl: './search.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Search {
  protected readonly searchSignal = inject(SearchService);
}
