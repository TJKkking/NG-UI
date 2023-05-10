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
 * @file Auth service
 */
import { HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Idle } from '@ng-idle/core';
import { APIURLHEADER, ERRORDATA } from 'CommonModel';
import { environment } from 'environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { ProjectModel } from '../models/VNFDModel';
import { RestService } from './RestService';

/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable()
export class AuthenticationService {
    /** To inject services @public */
    public injector: Injector;

    /** Instance for modal service @public */
    public modalService: NgbModal;

    /** Handle 401 response for multiple API calls */
    public handle401: boolean = true;

    /** contains return URL link @public */
    public returnUrl: string;

    /** Holds the username in condition of type BehaviorSubject<string> @public */
    public userName: BehaviorSubject<string> = new BehaviorSubject<string>('');

    /** Holds the projectname in condition of type BehaviorSubject<string> @public */
    public projectName$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    /** Holds the instance of router class @private */
    private router: Router;

    /** Holds the logged in condition of type BehaviorSubject<boolean> @private */
    private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Holds the change password in condition of type BehaviorSubject<boolean> @private */
    private changePassword: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Hold Rest Service Objects */
    private restService: RestService;

    /** Holds auth payloads @private */
    private payLoad: {};

    /** Holds header options for auth service @private */
    private httpOptions: HttpHeaders;

    /** handle idle time out service @private */
    private idle: Idle;

    /** create the instance of the component */
    constructor(injector: Injector) {
        this.injector = injector;
        this.router = this.injector.get(Router);
        this.restService = this.injector.get(RestService);
        this.modalService = this.injector.get(NgbModal);
        this.idle = this.injector.get(Idle);
        if (sessionStorage.getItem('username') !== null) {
            this.loggedIn.next(true);
            this.changePassword.next(false);
        } else if (sessionStorage.getItem('firstLogin') !== null) {
            this.changePassword.next(true);
            this.loggedIn.next(false);
        } else {
            this.loggedIn.next(false);
        }
        this.userName.next(sessionStorage.getItem('username'));
        this.redirectToPage();
    }

    /**
     * Get method for  Observable loggedIn
     */
    get isLoggedIn(): Observable<boolean> {
        return this.loggedIn.asObservable();
    }

    /**
     * Get method for  Observable changepassword
     */
    get isChangePassword(): Observable<boolean> {
        return this.changePassword.asObservable();
    }

    /**
     * Get method for Observable Username
     */
    get username(): Observable<string> {
        return this.userName.asObservable();
    }

    /** Get method for project name */
    get ProjectName(): Observable<string> {
        return this.projectName$.asObservable();
    }

    /**
     * Send request and authenticate the user
     * @param user of type User
     */
    public login(username: string, password: string): Observable<{}> {
        this.setHeader();
        this.setPayLoad(username, password);
        const apiURLHeader: APIURLHEADER = {
            url: environment.GENERATETOKEN_URL,
            httpOptions: { headers: this.httpOptions }
        };
        return this.restService.postResource(apiURLHeader, this.payLoad)
            .pipe(map((data: ProjectModel): BehaviorSubject<boolean> => {
                if (data.message === 'change_password') {
                    sessionStorage.setItem('firstLogin', 'true');
                    sessionStorage.setItem('id_token', data.id);
                    sessionStorage.setItem('user_id', data.user_id);
                    this.idle.watch(true);
                    this.changePassword.next(true);
                    this.loggedIn.next(false);
                    return this.changePassword;
                } else {
                    this.setLocalStorage(data);
                    this.idle.watch(true);
                    this.loggedIn.next(true);
                    this.handle401 = true;
                    this.userName.next(data.username);
                    return this.loggedIn;
                }
            }, (error: ERRORDATA): void => { this.restService.handleError(error, 'post'); }
            ));
    }

    /** Set headers for auth session @public */
    public setHeader(): void {
        this.httpOptions = new HttpHeaders({
            'Content-Type': 'application/json; charset=UTF-8',
            Accept: 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        });
    }

    /** Set payloads for auth session @public  */
    public setPayLoad(username: string, password: string): void {
        this.payLoad = JSON.stringify({
            username,
            password
        });
    }

    /** set local storage on auth process @public */
    public setLocalStorage(data: ProjectModel): void {
        sessionStorage.setItem('id_token', data.id);
        sessionStorage.setItem('expires', data.expires.toString());
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('isAdmin', (data.admin) ? 'true' : 'false');
        sessionStorage.setItem('project_id', data.project_id);
        sessionStorage.setItem('project', data.project_name);
        sessionStorage.setItem('token_state', data.id);
        this.projectName$.next(data.project_name);
    }
    /** Destory tokens API response handling @public */
    public logoutResponse(): void {
        this.loggedIn.next(false);
        this.changePassword.next(false);
        const langCode: string = sessionStorage.getItem('languageCode');
        const redirecturl: string = isNullOrUndefined(sessionStorage.getItem('returnUrl')) ? '/' : sessionStorage.getItem('returnUrl');
        const osmVersion: string = isNullOrUndefined(sessionStorage.getItem('osmVersion')) ? '' : sessionStorage.getItem('osmVersion');
        sessionStorage.clear();
        sessionStorage.setItem('languageCode', langCode);
        sessionStorage.setItem('returnUrl', redirecturl);
        sessionStorage.setItem('token_state', null);
        sessionStorage.setItem('osmVersion', osmVersion);
        this.idle.stop();
        this.router.navigate(['login']).catch();
    }
    /**
     * Logout the user & clearing the token.
     */
    public logout(): void {
        this.returnUrl = this.router.url;
        sessionStorage.setItem('returnUrl', this.returnUrl);
        this.modalService.dismissAll();
        this.destoryToken();
    }
    /** Destory tokens on logout @public */
    public destoryToken(): void {
        const tokenID: string = sessionStorage.getItem('id_token');
        if (tokenID !== null) {
            const deletingURl: string = environment.GENERATETOKEN_URL + '/' + tokenID;
            this.restService.deleteResource(deletingURl).subscribe((res: {}): void => {
                this.logoutResponse();
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'delete');
            });
        }
    }

    /** Return to previous page deny access to changepassword */
    public redirectToPage(): void {
        if (window.location.pathname === '/changepassword' && sessionStorage.getItem('username') !== null) {
            window.history.back();
        } else if (window.location.pathname === '/' && sessionStorage.getItem('firstLogin') === 'true') {
            this.router.navigate(['/login']).catch();
        }
    }
}
