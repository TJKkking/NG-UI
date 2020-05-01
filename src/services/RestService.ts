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
 * @file Provider for REST Service
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { ERRORDATA } from 'CommonModel';
import * as HttpStatus from 'http-status-codes';
import { Observable } from 'rxjs';

/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable()
/** Exporting a class @exports RestService */
export class RestService {
    /** convenient way to modify request made by the http service both before they are sent and after they return */
    private http: HttpClient;
    /** API URL. Disabled tslint since server doesn't support https protocol */
    private apiURL: string = '';
    /** Notifier service to popup notification @private */
    private notifierService: NotifierService;
    /** Instance for active modal service @public */
    private activeModal: NgbModal;
    /** insatnce for translate @private */
    private translateService: TranslateService;

    constructor(http: HttpClient, notifierService: NotifierService, activeModal: NgbModal, translateService: TranslateService) {
        this.http = http;
        this.notifierService = notifierService;
        this.activeModal = activeModal;
        this.translateService = translateService;
    }

    /**
     * Get a resource from the server which identified by a URI.
     * @param apiURL The URL of the resource to be retrieved.
     */

    public getResource(apiURL: string, httpHeaders?: { headers: HttpHeaders }): Observable<{}> {
        return this.http.get(apiURL, httpHeaders);
    }

    /**
     * Create a new resource on the server.
     * @param apiURL The URL of the resource to be created.
     * @param payload The request data to be sent to server.
     */

    public postResource(apiURLHeader: { url: string, httpOptions?: { headers: HttpHeaders } }, payload: {}): Observable<{}> {
        return this.http.post(apiURLHeader.url, payload, apiURLHeader.httpOptions);
    }

    /**
     * Modify the resource on the server.
     * @param apiURL The URL of the resource to be created.
     * @param payload The request data to be sent to server.
     */

    public patchResource(apiURLHeader: { url: string, httpOptions?: { headers: HttpHeaders } }, payload: {}): Observable<object> {
        return this.http.patch(apiURLHeader.url, payload, apiURLHeader.httpOptions);
    }

    /**
     * Replace the resource on the server.
     * @param apiName The URL of the resource to be created.
     * @param payload The request data to be sent to server.
     */

    public putResource(apiURLHeader: { url: string, httpOptions?: { headers: HttpHeaders } }, payload: {}): Observable<object> {
        return this.http.put(apiURLHeader.url, payload, apiURLHeader.httpOptions);
    }

    /**
     * Delete a resource identified by a URL.
     * @param apiURL The URL of the resource to be deleted.
     */

    public deleteResource(apiURL: string, httpHeaders?: { headers: HttpHeaders }): Observable<object> {
        return this.http.delete(apiURL, httpHeaders);
    }
    /**
     * Handle Error response based on the status.
     * @param error The error response reecieved from API call.
     * @param method The http request method.
     */
    // tslint:disable-next-line: cyclomatic-complexity
    public handleError(err: ERRORDATA, method?: string): void {
        if (err.error.status === HttpStatus.UNAUTHORIZED) {
            if (method !== 'get') {
                if (err.error.detail !== 'Expired Token or Authorization HTTP header' &&
                    err.error.detail !== 'Invalid Token or Authorization HTTP header') {
                    this.notifierService.notify('error', err.error.detail !== undefined ?
                        err.error.detail : this.translateService.instant('HTTPERROR.401'));
                }
                this.activeModal.dismissAll();
            }
        } else if (err.error.status === HttpStatus.BAD_REQUEST) {
            this.notifierService.notify('error', err.error.detail !== undefined ?
                err.error.detail : this.translateService.instant('HTTPERROR.400'));
        } else if (err.error.status === HttpStatus.NOT_FOUND) {
            this.notifierService.notify('error', err.error.detail !== undefined ?
                err.error.detail : this.translateService.instant('HTTPERROR.404'));
        } else if (err.error.status === HttpStatus.CONFLICT) {
            this.notifierService.notify('error', err.error.detail !== undefined ?
                err.error.detail : this.translateService.instant('HTTPERROR.409'));
            this.activeModal.dismissAll();
        } else if (err.error.status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.notifierService.notify('error', err.error.detail !== undefined ?
                err.error.detail : this.translateService.instant('HTTPERROR.500'));
        } else if (err.error.status === HttpStatus.BAD_GATEWAY) {
            this.notifierService.notify('error', this.translateService.instant('HTTPERROR.502'));
        } else if (err.error.status === HttpStatus.SERVICE_UNAVAILABLE) {
            this.notifierService.notify('error', this.translateService.instant('HTTPERROR.503'));
        } else if (err.error.status === HttpStatus.GATEWAY_TIMEOUT) {
            this.notifierService.notify('error', this.translateService.instant('HTTPERROR.504'));
        } else {
            this.notifierService.notify('error', err.error.detail !== undefined ?
                err.error.detail : this.translateService.instant('ERROR'));
        }
    }
}
