import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = async () => { const auth=inject(AuthService), router=inject(Router); await auth.restore(); return auth.profile() ? true : router.createUrlTree(['/login']); };
export const adminGuard: CanActivateFn = async () => { const auth=inject(AuthService), router=inject(Router); await auth.restore(); return auth.isAdmin() ? true : router.createUrlTree(['/dashboard']); };
