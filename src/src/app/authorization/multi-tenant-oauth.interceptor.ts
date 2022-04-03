import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { OAuthService, OAuthResourceServerErrorHandler } from "angular-oauth2-oidc";

import { Consts } from "@app/app-consts";
import { AppGlobals, TenantNameLocation } from "@app/app-globals";
import { AppUrlService } from "@app/app-url.service";

@Injectable({ providedIn: 'root' })
export class MultiTenantOAuthInterceptor implements HttpInterceptor {

    constructor(
        private urlService: AppUrlService,
        private oauthService: OAuthService,
        private errorHandler: OAuthResourceServerErrorHandler
    ) { }

    private shouldSendAccessToken(url: string): boolean {
        // gettings the OpenIdConnect configuration does not require an access token.
        if (url.indexOf('.well-known') !== -1) {
            return false;
        }

        // if the target Url is within the IdP we send the access token.
        const issuer = this.oauthService.issuer || '';
        if (url.startsWith(issuer.toLowerCase())) {
            return true;
        }

        // if the target Url is our backend we send the access token.
        if (url.startsWith(window.location.origin.toLowerCase())) {
            return true;
        }
        return false;
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // If multi-tenant is enabled and it is not the .well-known OAuth uri,
        // the url must be re-written to include the tenant name.
        if (!AppGlobals.disabledMultitenancy && req.url.indexOf('.well-known') === -1) {
            console.log('Intercepting multi-tenant request', req.url);

            const tenantName = this.urlService.getTenantName();
            if (!tenantName) {
                throw new Error('Unable to get the tenant name from the location.');
            }

            // ensure that the tenant name is within the url.
            req = req.clone({ url: this.urlService.ensureTenantName(req.url, tenantName) });
            console.log('Multi-tenant final request', req.url);
        }

        const token = this.oauthService.getAccessToken();

        if (this.shouldSendAccessToken(req.url) && token) {
            const header = 'Bearer ' + token;
            const headers = req.headers.set('Authorization', header);
            req = req.clone({ headers: headers });
        }

        return next
            .handle(req)
            .pipe(catchError(err => this.errorHandler.handleError(err)));
    }
}
