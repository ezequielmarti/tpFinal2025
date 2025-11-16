import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth-managment';
import { AuthSchema } from '../../../schema/user/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected readonly authSignal = this.auth;
  private returnUrl: string;

  credentials: AuthSchema = {
    account: '',
    password: ''
  };

  constructor() {
    const qpReturn = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = qpReturn || this.router.lastSuccessfulNavigation?.finalUrl?.toString() || '/home';

    effect(() => {
      const auth = this.auth.authState();
      if (auth.logged && !auth.loading) {
        this.router.navigateByUrl(this.returnUrl);
      }
    });
  }

  submit() {
    if (!this.credentials.account || !this.credentials.password) return;
    this.auth.logIn(this.credentials);
  }
}
