import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../general/login/auth-managment';
import { ERole } from '../../enum/role';

export const cartGuard: CanActivateFn = () => {
  const auth = inject(AuthService).authState();
  if (auth.logged && auth.role && (auth.role === ERole.User || auth.role === ERole.Seller)) {
    return true;
  }
  return inject(Router).createUrlTree(['/home']);
};
