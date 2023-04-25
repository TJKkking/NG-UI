/*
 Copyright 2020 TATA ELXSI

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 Author: KUMARAN M (kumaran.m@tataelxsi.co.in), RAJESH S (rajesh.s@tataelxsi.co.in), BARATH KUMAR R (barath.r@tataelxsi.co.in)
 */

/**
 * @file HttpInterceptor file
 */
import {
    HttpErrorResponse, HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent,
    HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { AuthenticationService } from 'AuthenticationService';
import * as HttpStatus from 'http-status-codes';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    /** Holds header options @private */
    private clonedReq: HttpRequest<{}>;

    /** To inject services @private */
    private injector: Injector;

    /** Notifier service to popup notification @private */
    private notifierService: NotifierService;

    /** Contains tranlsate instance @private */
    private translateService: TranslateService;

    /** Utilizes auth service for any auth operations @private */
    private authService: AuthenticationService;

    /** create the instance of the component */
    constructor(injector: Injector) {
        this.injector = injector;
        this.notifierService = this.injector.get(NotifierService);
        this.authService = this.injector.get(AuthenticationService);
        this.translateService = this.injector.get(TranslateService);
    }

    /**
     * intercept logic
     * @param req
     * @param next
     */
    public intercept(req: HttpRequest<{}>, next: HttpHandler): Observable<HttpSentEvent |
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        HttpHeaderResponse | HttpProgressEvent | HttpResponse<{}> | HttpUserEvent<any> | any> {
        const idToken: string = localStorage.getItem('id_token');
        const excludedUrl: string[] = ['osm/admin/v1/tokens', 'assets/i18n/', 'osm/version'];
        if (excludedUrl.some((x: string): boolean => req.url.includes(x))) { return next.handle(req); }
        if (idToken.length > 0) {
            this.setHeader(req, idToken);
            return next.handle(this.clonedReq).pipe(
                catchError((err: HttpErrorResponse) => {
                    this.errorRes(err, req, next);
                    return throwError(err);
                })
            );
        } else {
            //TODO: Handle error via notification service
        }
    }

    /** Set header options @public */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public setHeader(req: HttpRequest<any>, idToken: string): void {
        if (req.body !== null && req.body.byteLength !== null) {
            this.clonedReq = req.clone({
                setHeaders: { Authorization: 'Bearer ' + idToken, 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
            });
        } else {
            this.clonedReq = req.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + idToken,
                    'Content-Type': 'charset=UTF-8',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache'
                }
            });
        }
    }

    /** Handles error response @public */
    public errorRes(err: HttpErrorResponse, req: HttpRequest<{}>, next: HttpHandler): Observable<{}> {
        if (err instanceof HttpErrorResponse) {
            switch (err.status) {
                case HttpStatus.UNAUTHORIZED:
                case HttpStatus.FORBIDDEN:
                    this.handleError(err);
                    break;
                case HttpStatus.GATEWAY_TIMEOUT:
                case HttpStatus.BAD_GATEWAY:
                    this.notifierService.hideAll();
                    this.authService.logoutResponse();
                    break;
                default: return throwError(err);
            }
        } else { return throwError(err); }
    }

    /** Method to handle  401, 403 & 502 error */
    private handleError(err: HttpErrorResponse): void {
        if (err.error.detail !== 'Access denied: lack of permissions.' && err.error.detail !== 'You cannot remove system_admin role from admin user') {
            this.notifierService.hideAll();
            this.authService.logoutResponse();
            if (this.authService.handle401) {
                this.notifierService.notify('error', this.translateService.instant('SESSIONEXPIRY'));
                this.authService.handle401 = false;
            }
        }
    }
}
