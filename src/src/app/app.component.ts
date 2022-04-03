import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './authorization/auth.service';

import { AppGlobals } from '@app/app-globals';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'Angular Client App';

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {

        // Router event handlers
        this.router.events.pipe(
            filter(event => event instanceof NavigationStart)
        )
        .subscribe(event => {
            this.validateAttemptedTenantName(event as NavigationStart);
        });
    }

    private validateAttemptedTenantName(event: NavigationStart) {
        if (AppGlobals.disabledMultitenancy) {
            return;
        }
        if (event.url.toLowerCase() === '/lost-user') {
            return;
        }
        console.log('NavigationStart to: ', event.url);
        this.authService.validateAttemptedTenantName(event.url);
    }

    logout(): void { this.authService.logout(); }
    showLogout(): boolean { return this.authService.hasValidAccessToken(); }
}
