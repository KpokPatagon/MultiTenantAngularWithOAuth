import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {

        // By now this auth guard is only validating is the user is authenticated,
        // when in production this must also validate that the user has the
        // required roles to access a particular component.

        // If the user does not has the required roles and it is authenticated
        // his/her must be re-directed to a forbidden page instead of a login.

        return this.authService.isDoneLoading.pipe(
            filter(isdone => isdone),
            switchMap(() => this.authService.isAuthenticated),
            tap(isauthenticated => isauthenticated || this.authService.login(state.url))
        );
    }
}
