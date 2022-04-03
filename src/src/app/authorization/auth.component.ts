import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * The AuthComponent manages a logout process when it is invoked
 * from the IdP back or front channel.
 *
 */
@Component({
    template: `<p>auth component</p>`,
})
export class AuthComponent implements OnInit {

    constructor(
        private activatedRoute: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        console.log('this.activatedRoute.snapshot', this.activatedRoute);
        const action = this.activatedRoute.snapshot.url[0];
        switch (action.path) {
            case 'logout':
                this.authService.logout(true);
                break
            default:
                throw new Error(`Invalid action: '${action}'.`)
        }
    }
}
