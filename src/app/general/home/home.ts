import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HomeService } from './home-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class Home {
  protected readonly productSignal = inject(HomeService);

}
