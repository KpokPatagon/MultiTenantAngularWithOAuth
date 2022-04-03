export enum TenantNameLocation {
    Host = 0,
    Path = 1,
}

export class AppGlobals {

    /**
     * Whether multi-tenancy is disabled.
     */
    static disabledMultitenancy: boolean = false;

    /**
     * Location where the tenant name is within the url.
     */
    static tenantNameLocation: TenantNameLocation = TenantNameLocation.Path;
}
