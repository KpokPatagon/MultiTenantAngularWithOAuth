import { HttpResponse } from "@angular/common/http";
import { OAuthResourceServerErrorHandler } from "angular-oauth2-oidc";
import { Observable, throwError } from "rxjs";

export class BackendOAuthResourceServerErrorHandler implements OAuthResourceServerErrorHandler {

    /**
     * This method should handle HTTP errors from back end applications like this
     * App back and or the IdP, etc.
     * 401 and 403 errors must be handled appropiately althogh they should't occur.
     * 503 errors might be thrown, for example, when the tenant does not exists or
     * is not enabled for any reason that might show to the user appropiately.
     *
     * @param err An HttpResponse error.
     */
    handleError(err: HttpResponse<any>): Observable<any> {
        // TODO: handle 401 and 403 status codes and 503 for a tenant that is not enabled!
        return throwError(err);
    }
}
