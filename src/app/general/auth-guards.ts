import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ERole } from '../../enum/role';
import { AuthService } from './login/auth-managment';

const loginUrlTree = () => inject(Router).createUrlTree(['/login']);
const homeUrlTree = () => inject(Router).createUrlTree(['/home']);

const checkRoles = (allowed: ERole[]): boolean | ReturnType<Router['createUrlTree']> => {
  const auth = inject(AuthService).authState();
  if (!auth.logged) {
    return loginUrlTree();
  }
  if (!auth.role) {
    return homeUrlTree();
  }
  return allowed.includes(auth.role) ? true : homeUrlTree();
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService).authState();
  if (auth.logged) {
    return true;
  }
  return loginUrlTree();
};

export const adminGuard: CanActivateFn = () => checkRoles([ERole.Admin]);

export const sellerGuard: CanActivateFn = () => checkRoles([ERole.Seller, ERole.Business, ERole.Admin]);

export const buyerGuard: CanActivateFn = () => checkRoles([ERole.User, ERole.Seller]);
