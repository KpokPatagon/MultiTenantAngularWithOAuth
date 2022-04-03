import { Injectable } from '@angular/core';
import { Consts } from './app-consts';
import { AppGlobals, TenantNameLocation } from './app-globals';

@Injectable({ providedIn: 'root' })
export class AppUrlService {
    constructor() { }

    /**
     * Ensures that the provided Uri does contains the specified tenant name within the right position.
     * @param uri An attempted Uri that must contains a tenant name.
     * @param tenantName The tenant name to be included within the Url
     * @returns A Uri with the tenant name included.
     */
    public ensureTenantName(uri: string, tenantName: string | undefined): string {
        tenantName = tenantName || '';
        let url = new URL(uri);

        if (AppGlobals.tenantNameLocation == TenantNameLocation.Host) {
            if (url.host.indexOf(Consts.TenantPlaceHolder)) {
                url.host.replace(Consts.TenantPlaceHolder, tenantName);
            } else if (!url.host.toLowerCase().startsWith(tenantName.toLowerCase())) {
                url.host = `${tenantName}.${url.host}`;
            }
        }

        if (AppGlobals.tenantNameLocation == TenantNameLocation.Path) {
            if (url.pathname.indexOf(Consts.TenantPlaceHolder) !== -1) {
                url.pathname.replace(Consts.TenantPlaceHolder, tenantName);
            } else if (!url.pathname.toLowerCase().startsWith(`/${tenantName.toLowerCase()}`)) {
                url.pathname = `/${tenantName}${url.pathname}`;
            }
        }

        return url.toString();
    }

    /**
     * Extracts the tenant name from the current location.
     * @returns The tenant name from the url.
     */
    public getTenantName(): string | undefined {
        if (AppGlobals.tenantNameLocation == TenantNameLocation.Host) {
            return window.location.hostname.split('.')[0];
        }
        if (AppGlobals.tenantNameLocation == TenantNameLocation.Path) {
            const url = window.location.pathname === '/' ? '' : window.location.pathname;
            return url.split('/')[1];
        }
        return undefined;
    }
}
