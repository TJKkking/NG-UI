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
 * @file Page for Login component
 */
import { isNullOrUndefined } from 'util';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'AuthenticationService';
import { ERRORDATA } from 'CommonModel';
import { environment } from 'environment';
import { ToastrService } from 'ngx-toastr';
import { RestService } from 'RestService';
import { Observable } from 'rxjs';
import { SharedService } from 'SharedService';
import { UserDetail } from 'UserModel';

/**
 * Creating component
 * @Component takes LoginComponent.html as template url
 */
@Component({
    selector: 'app-login',
    templateUrl: './LoginComponent.html',
    styleUrls: ['./LoginComponent.scss']
})
/** Exporting a class @exports LoginComponent */
export class LoginComponent implements OnInit {
    /** Invoke service injectors @public */
    public injector: Injector;

    /** contains loginform group information @public */
    public loginForm: FormGroup;

    /** submitted set to boolean state @public */
    public submitted: boolean = false;

    /** contains return URL link @public */
    public returnUrl: string;

    /** Observable Hold the value of subscription  @public */
    public isLoggedIn$: Observable<boolean>;

    /** Observable Hold the value of subscription  @public */
    public isChangePassword$: Observable<boolean>;

    /** contains access token information @public */
    public accessToken: string;

    /** Utilizes rest service for any CRUD operations @public */
    public restService: RestService;

    /** Check the loading results @public */
    public isLoadingResults: boolean = false;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** Contains all methods related to shared @public */
    public sharedService: SharedService;

    /** contains the loggedIn observable value @public */
    public loggedIn: boolean;

    /** Contains Last Login information @public */
    public lastLogin: string;

    /** Holds Last Login Toaster Message @public */
    public lastLoginMessage: string;

    /** Holds Failed Attempts Toaster Message @public */
    public failedAttemptsMessage: string;

    /** Holds Password Expire Toaster Message @public */
    public passwordExpireMessage: string;

    /** Holds Account Expire Toaster Message @public */
    public accountExpireMessage: string;

    /** Holds password & account Toaster Message @public */
    public daysMessage: string;

    /** Holds account Days Toaster Message @public */
    public accountMessage: string;

    /** Holds password Days Toaster Message @public */
    public passwordMessage: string;

    /** Contains user details information @public */
    public userDetails: UserDetail;

    /** contains No of failed attempts values @public */
    public failedAttempts: string;

    /** contains No of days to expire account @public */
    public accountNoOfDays: string;

    /**  contains No of days to expire password @public */
    public passwordNoOfDays: string;

    /** User Visibility Check  @public */
    public isUserShow: boolean;

    /** Admin Visibility Check  @public */
    public isAdminShow: boolean;

    /** contains the passwordIn observable value @public */
    public changePassword: boolean;

    /** Utilizes auth service for any auth operations @private */
    private authService: AuthenticationService;

    /** contians form builder module @private */
    private formBuilder: FormBuilder;

    /** Holds teh instance of AuthService class of type AuthService @private */
    private router: Router;

    /** Contains tranlsate instance @private */
    private translateService: TranslateService;

    /** Contains toaster instance @private */
    private toaster: ToastrService;

    /** express number for expire days @private */
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private expireDays: number = 5;

    /** express number for time manupulation 1000 */
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private epochTime1000: number = 1000;

    /** contains toaster settings */
    private toasterSettings: {} = {
        enableHtml: true,
        closeButton: true,
        timeOut: 2000
    };

    // creates instance of login component
    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.authService = this.injector.get(AuthenticationService);
        this.formBuilder = this.injector.get(FormBuilder);
        this.router = this.injector.get(Router);
        this.sharedService = this.injector.get(SharedService);
        this.translateService = this.injector.get(TranslateService);
        this.toaster = this.injector.get(ToastrService);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.isLoggedIn$ = this.authService.isLoggedIn;
        this.isLoggedIn$.subscribe((res: boolean): void => {
            this.loggedIn = res;
        });
        if (this.loggedIn === true) {
            this.router.navigate(['/']).catch((): void => {
                // Catch Navigation Error
            });
        }
        this.isChangePassword$ = this.authService.isChangePassword;
        this.isChangePassword$.subscribe((res: boolean): void => {
            this.changePassword = res;
        });
        if (this.changePassword === true) {
            this.router.navigate(['changepassword']).catch((): void => {
                // Catch Navigation Error
            });
        }

        this.loginForm = this.formBuilder.group({
            userName: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
        this.returnUrl = isNullOrUndefined(localStorage.getItem('returnUrl')) ? '/' : localStorage.getItem('returnUrl');
    }

    /**
     * called on form submit @private onSubmit
     */
    public onSubmit(): void {
        this.submitted = true;
        if (this.loginForm.invalid) {
            return;
        }
        this.isLoadingResults = true;
        this.sharedService.cleanForm(this.loginForm);
        this.isLoadingResults = false;
        if (!this.loginForm.invalid) {
            this.loginUser();
        }
    }

    /** Login User @public */
    public loginUser(): void {
        this.authService.login(this.loginForm.value.userName, this.loginForm.value.password).subscribe(
            (data: {}): void => {
                this.isLoadingResults = false;
                if (this.changePassword === true && this.loggedIn === false) {
                    this.router.navigate(['/changepassword']).catch((): void => {
                        // Catch Navigation Error
                    });
                } else {
                    this.router.navigate([this.returnUrl]).catch((): void => {
                        // Catch Navigation Error
                    });
                    this.isAdminShow = localStorage.getItem('admin_show') === 'true' ? true : false;
                    this.isUserShow = localStorage.getItem('user_show') === 'true' ? true : false;
                    setTimeout((): void => {
                        if (this.isAdminShow === true || this.isUserShow === true) {
                            this.generateData();
                        }
                    }, this.epochTime1000);
                }
                localStorage.removeItem('returnUrl');
            }, (err: HttpErrorResponse): void => {
                this.isLoadingResults = false;
                this.restService.handleError(err, 'post');
            });
    }

    /** Fetching the data from server to load it in toaster @public */
    public generateData(): void {
        const userID: string = localStorage.getItem('user_id');
        if (userID !== '') {
            this.isLoadingResults = true;
            this.restService.getResource(environment.USERS_URL + '/' + userID).subscribe((userDetails: UserDetail): void => {
                this.userDetails = userDetails;
                if (!isNullOrUndefined(userDetails)) {
                    const account: string = this.sharedService.convertEpochTime(!isNullOrUndefined(userDetails._admin) ?
                        userDetails._admin.account_expire_time : null);
                    const password: string = this.sharedService.convertEpochTime(!isNullOrUndefined(userDetails._admin) ?
                        userDetails._admin.password_expire_time : null);
                    const accountExpire: number = this.sharedService.converEpochToDays(account);
                    const passwordExpire: number = this.sharedService.converEpochToDays(password);
                    if (accountExpire >= 0 && accountExpire <= this.expireDays) {
                        this.accountNoOfDays = String(accountExpire);
                    }
                    if (passwordExpire >= 0 && passwordExpire <= this.expireDays) {
                        this.passwordNoOfDays = String(passwordExpire);
                    }
                    this.lastLoginMessage = this.translateService.instant('PAGE.LOGIN.LASTACCESS');
                    this.failedAttemptsMessage = this.translateService.instant('PAGE.LOGIN.FAILED');
                    this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRE');
                    this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRE');
                    this.daysMessage = this.translateService.instant('PAGE.LOGIN.DAYS');
                    this.lastLogin = localStorage.getItem('last_login');
                    this.failedAttempts = localStorage.getItem('failed_count');
                    if (this.accountNoOfDays !== '0' && this.passwordNoOfDays !== '0' &&
                        this.accountNoOfDays !== '1' && this.passwordNoOfDays !== '1') {
                        this.showToaster();
                    }
                    this.passwordExpiryToaster();
                    this.accountExpiryToaster();
                }
                this.isLoadingResults = false;
            }, (error: ERRORDATA): void => {
                this.isLoadingResults = false;
                this.restService.handleError(error, 'get');
            });
        }
    }

    /** To display password expiry Toaster with required data @public */
    public passwordExpiryToaster(): void {
        if ((this.accountNoOfDays === '1' && this.passwordNoOfDays === '1') ||
            (this.accountNoOfDays === '0' && this.passwordNoOfDays === '0')) {
            this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRETODAY');
            this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRETODAY');
            if (this.accountNoOfDays === '1') {
                this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRETOMORROW');
                this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRETOMORROW');
            }
            this.passwordMessage = '';
            this.accountMessage = '';
            this.accountNoOfDays = '';
            this.passwordNoOfDays = '';
            this.sharedService.showToaster(this.lastLogin, this.failedAttempts, this.passwordNoOfDays, this.accountNoOfDays,
                this.passwordExpireMessage, this.accountExpireMessage, this.passwordMessage, this.accountMessage);
        } else if (!isNullOrUndefined(this.passwordNoOfDays)) {
            if ((this.passwordNoOfDays === '0') || this.passwordNoOfDays === '1' ||
                (this.passwordNoOfDays === '0' && (isNullOrUndefined(this.accountNoOfDays) || !isNullOrUndefined(this.accountNoOfDays))) ||
                (this.passwordNoOfDays === '1' && (isNullOrUndefined(this.accountNoOfDays) || !isNullOrUndefined(this.accountNoOfDays)))
            ) {
                if (this.passwordNoOfDays === '1') {
                    this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRETOMORROW');
                    this.passwordMessage = '';
                    this.passwordNoOfDays = '';
                } else if (this.passwordNoOfDays === '0') {
                    this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRETODAY');
                    this.passwordMessage = '';
                    this.passwordNoOfDays = '';
                }
                if (isNullOrUndefined(this.accountNoOfDays)) {
                    this.sharedService.passwordToaster(this.lastLogin, this.failedAttempts, this.passwordNoOfDays,
                        this.passwordExpireMessage, this.passwordMessage);
                } else {
                    if (this.accountNoOfDays === '1') {
                        this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRETOMORROW');
                        this.accountMessage = '';
                        this.accountNoOfDays = '';
                    } else if (this.accountNoOfDays === '0') {
                        this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRETODAY');
                        this.accountMessage = '';
                        this.accountNoOfDays = '';
                    } else {
                        this.accountExpireMessage = this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRE');
                        this.accountMessage = this.translateService.instant('PAGE.LOGIN.DAYS');
                    }
                    this.sharedService.showToaster(this.lastLogin, this.failedAttempts, this.passwordNoOfDays, this.accountNoOfDays,
                        this.passwordExpireMessage, this.accountExpireMessage, this.passwordMessage, this.accountMessage);
                }
            }
        }
    }
    /** To display account expiry Toaster with required data @public */
    public accountExpiryToaster(): void {
        if (!isNullOrUndefined(this.accountNoOfDays)) {
            if ((this.accountNoOfDays === '0') || (this.accountNoOfDays === '1') || ((this.accountNoOfDays === '0') &&
                (isNullOrUndefined(this.passwordNoOfDays) || !isNullOrUndefined(this.passwordNoOfDays))) ||
                ((this.accountNoOfDays === '1') && (isNullOrUndefined(this.passwordNoOfDays) || !isNullOrUndefined(this.passwordNoOfDays)))
                && this.passwordNoOfDays !== '0' && this.passwordNoOfDays !== '1') {
                if (this.accountNoOfDays === '1') {
                    this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRETOMORROW');
                    this.accountMessage = '';
                    this.accountNoOfDays = '';
                } else if (this.accountNoOfDays === '0') {
                    this.accountExpireMessage = this.translateService.instant('PAGE.LOGIN.ACCOUNTEXPIRETODAY');
                    this.accountMessage = '';
                    this.accountNoOfDays = '';
                }
                if (isNullOrUndefined(this.passwordNoOfDays)) {
                    this.sharedService.accountToaster(this.lastLogin, this.failedAttempts,
                        this.accountNoOfDays, this.accountExpireMessage, this.accountMessage);
                } else {
                    if (this.passwordNoOfDays === '1') {
                        this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRETOMORROW');
                        this.passwordMessage = '';
                        this.passwordNoOfDays = '';
                    } else if (this.passwordNoOfDays === '0') {
                        this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRETODAY');
                        this.passwordMessage = '';
                        this.passwordNoOfDays = '';
                    } else {
                        this.passwordExpireMessage = this.translateService.instant('PAGE.LOGIN.PASSWORDEXPIRE');
                        this.passwordMessage = this.translateService.instant('PAGE.LOGIN.DAYS');
                    }
                    this.sharedService.showToaster(this.lastLogin, this.failedAttempts, this.passwordNoOfDays, this.accountNoOfDays,
                        this.passwordExpireMessage, this.accountExpireMessage, this.passwordMessage, this.accountMessage);
                }
            }
        }
    }
    /** To display password & account expiry Toaster with required data @public */
    public showToaster(): void {
        if (!isNullOrUndefined(this.accountNoOfDays) && !isNullOrUndefined(this.passwordNoOfDays)) {
            this.toaster.info(this.lastLoginMessage + ':' + '&nbsp' + this.lastLogin +
                '</br>' + this.failedAttemptsMessage + ':' + '&nbsp' + this.failedAttempts +
                '</br>' + this.passwordExpireMessage + '&nbsp' + this.passwordNoOfDays + '&nbsp' + this.daysMessage +
                '</br>' + this.accountExpireMessage + '&nbsp' + this.accountNoOfDays + '&nbsp' + this.daysMessage,
                this.translateService.instant('PAGE.LOGIN.LOGINHISTORY'), this.toasterSettings);
        } else if (!isNullOrUndefined(this.accountNoOfDays) || !isNullOrUndefined(this.passwordNoOfDays)) {
            if (!isNullOrUndefined(this.passwordNoOfDays)) {
                this.toaster.info(this.lastLoginMessage + ':' + '&nbsp' + this.lastLogin +
                    '</br>' + this.failedAttemptsMessage + ':' + '&nbsp' + this.failedAttempts +
                    '</br>' + this.passwordExpireMessage + '&nbsp' + this.passwordNoOfDays + '&nbsp' + this.daysMessage,
                    this.translateService.instant('PAGE.LOGIN.LOGINHISTORY'), this.toasterSettings);
            } else if (!isNullOrUndefined(this.accountNoOfDays)) {
                this.toaster.info(
                    this.lastLoginMessage + ':' + '&nbsp' + this.lastLogin +
                    '</br>' + this.failedAttemptsMessage + ':' + '&nbsp' + this.failedAttempts +
                    '</br>' + this.accountExpireMessage + '&nbsp' + this.accountNoOfDays + '&nbsp' + this.daysMessage,
                    this.translateService.instant('PAGE.LOGIN.LOGINHISTORY'), this.toasterSettings);
            }
        } else {
            this.toaster.info(this.lastLoginMessage + ':' + '&nbsp' + this.lastLogin +
                '</br>' + this.failedAttemptsMessage + ':' + '&nbsp' + this.failedAttempts,
                this.translateService.instant('PAGE.LOGIN.LOGINHISTORY'), this.toasterSettings);
        }
    }
}
