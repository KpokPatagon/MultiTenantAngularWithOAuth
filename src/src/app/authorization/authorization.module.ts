import { NgModule, APP_INITIALIZER, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OAuthModule, OAuthStorage, OAuthResourceServerErrorHandler } from 'angular-oauth2-oidc';

import { authAppInitializerFactory } from './auth-app-initializer.factory';
import { AuthService } from './auth.service';
import { AuthComponent } from './auth.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { MultiTenantOAuthInterceptor } from './multi-tenant-oauth.interceptor';
import { BackendOAuthResourceServerErrorHandler } from './backend-oauth-resource-server-error-handler';

// We need a factory sin localStorage is not available a AOT build time
export function storageFactory(): OAuthStorage {
    return localStorage;
}

@NgModule({
    imports: [
        HttpClientModule,
        OAuthModule.forRoot(),
    ],
    declarations: [
        AuthComponent,
        ForbiddenComponent,
    ]
})
export class AuthorizationModule {

    static forRoot(): ModuleWithProviders<AuthorizationModule> {
        return {
            ngModule: AuthorizationModule,
            providers: [
                { provide: OAuthStorage, useFactory: storageFactory },
                { provide: OAuthResourceServerErrorHandler, useClass: BackendOAuthResourceServerErrorHandler },
                { provide: APP_INITIALIZER, useFactory: authAppInitializerFactory, deps: [AuthService], multi: true },
                { provide: HTTP_INTERCEPTORS, useClass: MultiTenantOAuthInterceptor, multi: true },
            ]
        };
    }

    constructor(@Optional() @SkipSelf() parentModule: AuthorizationModule) {
        if (parentModule) {
            throw new Error('AuthorizationModule is already loaded. Import it in the AppModule only.');
        }
    }
}
