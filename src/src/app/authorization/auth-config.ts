import { environment } from '@env/environment';
import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {

    // Url of the Identity Provider
    issuer: 'https://kpoksecurity.local',

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin + '/index.html',

    // URL of the SPA to redirect the user to after logout
    postLogoutRedirectUri: window.location.origin + '/logged-out',

    // The SPA's id. The SPA is registerd with this id at the auth-server
    // clientId: 'server.code',
    clientId: '58ec7eda-d78e-4478-9b89-219720ee2d08',

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    responseType: 'code',

    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one
    scope: 'openid profile email offline_access tenant_name',

    showDebugInformation: !environment.production,
};
