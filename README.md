# MultiTenantAngularWithOAuth
Concept proof and documentation of a multi-tenant Angular application that uses OAuth/OpenIdConnect for user sign on.

# Dependencies
This project depends, among others in the following project.

- [angular-oauth2-odic](https://github.com/manfredsteyer/angular-oauth2-oidc)   
  The OAuth/OpenIdConnect interaction is done using this library.

# Resources
While building the proof of concept project I found code and hints in the following repos and web sites.

- [sample-angular-oauth2-oidc-with-auth-guards](https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/)
- [Multi tenancy in Angular apps](http://www.lukasjakob.com/multi-tenancy-in-angular-apps/)

# How does it works
This application works by extacting the tenant name from the first segment of the URL path and then use this value to access the identity provider and the backend application (although the last part is not yet implemented).

The identity provider - and later the backend of the application - works in the same way, let's say, using a URL like: `https://my.app.com/tenant_a/...` the application must extract the tenant name from the path and then provide services for the specified tenant.

The application should also work with the tenant name within the host as in `https://tenant_a.my.app.com/...` if the identity provider and the backend supports it.

# Implementation documentation
This application is an Angular-CLI basic application, and the documentation for what I'm trying to proof here is within the source code, in particular within the following components:

- `AppComponent`   
  The `AppComponent` implements an event handler for the Angular `NavigationStart` event. Within it the tenant name is extracted from the path and then validated before usage.

- `AppRoutingModule`   
  The application routing module defines the Angular routes with a tenant placeholder.

- `AuthorizationModule`   
  The authorization module is based on the community provided sample (see resources above) with modifications to allow multi-tenancy operations.

- `AuthService`   
  The `AuthService` wraps the OAuth/OpenIdConnect functionality through the `angular-oauth2-odic` component.

- `MultiTenantOAuthInterceptor`   
  An Angular `HttpInterceptor` that manages request interception for multi-tenantcy and authorization.
