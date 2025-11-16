import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeService } from './home-service';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class Home implements OnInit {
  protected readonly productSignal = inject(HomeService);

  ngOnInit(): void {
    this.productSignal.getTotalProducts();
    this.productSignal.getProducts();
    this.productSignal.getFeatured(4);
  }
}
