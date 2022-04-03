import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { OAuthService, OAuthErrorEvent, OAuthStorage, AuthConfig } from 'angular-oauth2-oidc';

import { environment } from '@env/environment';
import { AppGlobals } from '@app/app-globals';
import { ClaimTypes } from '@app/app-consts';
import { AppUrlService } from '@app/app-url.service';

/**
 * Provides authentication and authorization services fo the application.
 *
 * As it is a multi-tenant application this service also provides tenant
 * validation and tenant information.
 *
 * See https://github.com/manfredsteyer/angular-oauth2-oidc
 * and https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/
 * for more information.
 *
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    private isDoneLoadingSubject = new BehaviorSubject<boolean>(false);
    private validatedTenantName: string | undefined;

    public isAuthenticated = this.isAuthenticatedSubject.asObservable();
    public isDoneLoading = this.isDoneLoadingSubject.asObservable();

    /**
     * Publishes `true` if and only if (a) all the asynchronous initial
     * login calls have completed or errorred, and (b) the user ended up
     * being authenticated.
     *
     * In essence, it combines:
     *
     * - the latest known state of whether the user is authorized
     * - whether the ajax calls for initial log in have all been done
     */
    public canActivateProtectedRoutes: Observable<boolean> = combineLatest([
        this.isAuthenticated,
        this.isDoneLoading
    ]).pipe(map(values => values.every(b => b)));

    constructor(
        private oauthService: OAuthService,
        private oauthStorage: OAuthStorage,
        private router: Router,
        private urlService: AppUrlService
    ) {
        this.oauthService.events.subscribe(event => {
            this.isAuthenticatedSubject.next(this.oauthService.hasValidAccessToken());

            if (event instanceof OAuthErrorEvent) {
                console.error('OAuthErrorEvent ->', event);
            }

            // useful for debugging
            if (!environment.production && !(event instanceof OAuthErrorEvent)) {
                console.log('OAuthEvent ->', event);
            }
        });

        this.oauthService.events
            .pipe(filter(e => ['token_received'].includes(e.type)))
            .subscribe(e => this.oauthService.loadUserProfile());

        this.oauthService.events
            .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
            .subscribe(() => this.login());

        // This is tricky, as it might cause race conditions (where access_token
        // is set in another tab before everything is said and done there.
        // See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/issues/2
        window.addEventListener('storage', event => {
            // The key is null if the event was caused by .clear()
            if (!event.key || event.key !== 'access_token') {
                return;
            }

            console.warn('Noticed changes to access_token, updating isAuthenticated');
            this.isAuthenticatedSubject.next(this.oauthService.hasValidAccessToken());

            if (!this.oauthService.hasValidAccessToken()) {
                this.login();
            }
        });

        this.oauthService.setupAutomaticSilentRefresh();
    }

    /**
     * Creates the OAuth configuration.
     * Althogh the configuration is currently hardcoded, this method must receive
     * the actual configuration as a parameter which must be get from a back end
     * application service.
     *
     * @returns An AuthConfig object for the angular-oauth2-oidc component.
     */
    private createOAuthConfig(): AuthConfig {
        return {
            issuer: 'https://kpoksecurity.local',   // Sorry but this IdP is not public, at least not yet!
            redirectUri: window.location.origin + '/index.html',
            postLogoutRedirectUri: window.location.origin + '/logged-out',
            clientId: '58ec7eda-d78e-4478-9b89-219720ee2d08',
            scope: 'openid profile email offline_access tenant_name',
            responseType: 'code',
            showDebugInformation: !environment.production,

            /**
             * This method is called be the angular-oauth2-oidc component to navigate to
             * the IdP for log in/out and so on.
             *
             * As the Idp requires the tenant name within the path, this method ensures
             * that the current tenant name is within it before navigation.
             *
             * @param uri The Uri to nagigate to.
             */
            openUri: (uri: string): void => {
                if (!AppGlobals.disabledMultitenancy) {
                    const tenantName = this.getUserTenantName() ||
                                       this.validatedTenantName ||
                                       this.urlService.getTenantName();
                    if (!tenantName) {
                        throw new Error('Unable to get tenant name!');
                    }
                    uri = this.urlService.ensureTenantName(uri, tenantName);
                }
                window.location.href = uri;
            }
        };
    }

    /**
     * Gets the current user tenant name.
     * @returns Current user tenant name or undefined.
     */
    public getUserTenantName(): string | undefined {
        if (this.oauthService.hasValidAccessToken()) {
            const claims: any = this.oauthService.getIdentityClaims();
            return claims[ClaimTypes.TenantName];
        }
        return undefined;
    }

    /**
     * Gets whether there is a valid access token.
     * @returns true if the is a valid access token, otherwise false.
     */
    public hasValidAccessToken(): boolean {
        return this.oauthService.hasValidAccessToken();
    }

    /**
     * Initiates the login flow.
     * @param targetUrl Target url to navigate after a successfull login.
     */
    public login(targetUrl?: string): void {
        this.oauthService.initLoginFlow(targetUrl || this.router.url);
    }

    /**
     * Initiates the logout process.
     * @param noRedirectToLogoutUrl Whether to redirect to the logout url or not.
     */
    public logout(noRedirectToLogoutUrl?: boolean): void {
        noRedirectToLogoutUrl = noRedirectToLogoutUrl || false;
        if (!this.oauthService.hasValidAccessToken()) {
            return;
        }

        if (!AppGlobals.disabledMultitenancy && this.oauthService.postLogoutRedirectUri) {
            const tenantName = this.getUserTenantName() ||
                                this.validatedTenantName ||
                                this.urlService.getTenantName();
            if (!tenantName) {
                throw new Error('Unable to get tenant name!');
            }

            // This application requires that the post logout url includes the tenant name.
            this.oauthService.postLogoutRedirectUri =
                this.urlService.ensureTenantName(this.oauthService.postLogoutRedirectUri || '', tenantName);
        }
        this.oauthService.logOut(noRedirectToLogoutUrl);
    }

    /**
     * Refresh tokens.
     */
    public refresh(): void {
        this.oauthService.refreshToken();
    }

    /**
     * Initializes the angular-oauth2-oidc library.
     * See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/
     *
     */
    public runInitialLoginSequence(): Promise<void> {
        console.log('Running initial login sequence...');

        // TODO: Call a back end service to get the OpenIdConnect configuration
        //       and pass that info to the createOAuthConfig method.
        // This requires a simple API that provides the required data.
        this.oauthService.configure(this.createOAuthConfig());

        // 0. Get IdS configuration
        return this.oauthService.loadDiscoveryDocument()

            // 1. Try to log in after redirect back from IdS
            .then(() => this.oauthService.tryLogin())
            .then(() => {
                if (this.oauthService.hasValidAccessToken()) {
                    return Promise.resolve();
                }
                if (!this.oauthStorage.getItem('refresh_token')) {
                    return Promise.resolve();
                }

                // 2. Try to log in via refresh
                //    to avoid redirecting the user
                return this.oauthService.refreshToken()
                    .then(() => Promise.resolve())
                    .catch(result => {

                        // Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
                        // Only the ones where it's reasonably sure that sending the
                        // user to the IdS will help
                        const errorResponsesRequiringUserInteraction = [
                            'interaction_required',
                            'login_required',
                            'account_selection_required',
                            'consent_required',
                        ];

                        if (result && result.reason &&
                            errorResponsesRequiringUserInteraction.indexOf(result.reason.error) >= 0) {

                            // 3. At this point we know for sure that we have to ask the
                            // user to log in, so we redirect them to the IdS to enter
                            // credentials
                            //
                            // Enable this to ALWAYS force a user to log in
                            // this.login();
                            //
                            console.warn('User interction is needed to log in, wait until an auth guard starts it.');
                            return Promise.resolve();
                        }

                        // We can't handle the truth, just pass the problem on
                        // to the next handler
                        // I love the comment from the community sample :-)
                        return Promise.reject(result);
                    });
            })
            .then(() => {
                this.isDoneLoadingSubject.next(true);

                // Check for the strings 'undefined' and 'null' just to be sure,
                // in case someone ever calls initLoginFlow(undefined | null)
                if (this.oauthService.state &&
                    this.oauthService.state != 'null' &&
                    this.oauthService.state != 'undefined') {
                        let stateUrl = this.oauthService.state;
                        if (stateUrl.startsWith('/') === false) {
                            stateUrl = decodeURIComponent(stateUrl);
                        }
                        console.log(`There was a state of ${this.oauthService.state}, so we are sending you to: ${stateUrl}`);
                        this.router.navigateByUrl(stateUrl);
                    }
            })
            .catch(() => this.isDoneLoadingSubject.next(true));
    }

    /**
     * This method validates that the attempted tenant name during navigation
     * is valid and the action can continue.
     *
     * If the user is authenticated and the attempted tenant name is equals to
     * the logged in user tenant name, the attempt is valid, if not the user
     * is redirected to a "lost user" page.
     *
     * If the user is not authenticated the attemped tenant name is validated
     * against a backend service, is the tenant name attempt is not valid,
     * the user is redirected to a "lost user" page.
     *
     * @param attemptedUrl The attempted Url from the NavigationStart event.
     */
    public validateAttemptedTenantName(attemptedUrl: string): void {
        if (AppGlobals.disabledMultitenancy) {
            this.validatedTenantName = undefined;
            return;
        }
        console.log(`Validating tenant name from attempted Url: ${attemptedUrl}`);

        const url = attemptedUrl === '/' ? '' : attemptedUrl;
        const path = url.split('?')[0].split('/');
        const attempted = path[1];

        if (!attempted || attempted === '') {
            console.warn('Attempted tenant name is null or empty!');
            this.router.navigate(['/lost-user']);
        }
        console.log(`Validating tenant name: ${attempted}`);

        if (this.oauthService.hasValidAccessToken()) {
            const userTenantName = this.getUserTenantName();
            if (!userTenantName) {
                throw new Error('Missing TenantName claim for a multi-tenant enabled application!');
            }

            if (userTenantName.toLowerCase() === attempted.toLowerCase()) {
                this.validatedTenantName = userTenantName;
                return; // tenant names matched, we are good
            }

            console.warn(`Attempted tenant name "${attempted}" does not matches with current user tenant name: ${userTenantName}.`);
            this.router.navigate(['/lost-user']);

        } else {

            // TODO: call a real service!
            //       An API must be implemented that checks if the tenant name
            //       is valid or not.
            //       I'm thinking that this API must be implemented by the IdP so
            //       there is one that can be shared among client applications.
            const tenants = ['dev', "dev1"];
            if (tenants.includes(attempted.toLowerCase())) {
                this.validatedTenantName = attempted;
                return;
            }

            console.warn(`Attempted tenant name invalid: ${attempted}.`);
            this.router.navigate(['/lost-user']);
        }
    }
}
