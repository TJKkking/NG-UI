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
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'AuthenticationService';
import { RestService } from 'RestService';
import { Observable } from 'rxjs';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';

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

    /** contains the passwordIn observable value @public */
    public changePassword: boolean;

    /** Utilizes auth service for any auth operations @private */
    private authService: AuthenticationService;

    /** contians form builder module @private */
    private formBuilder: FormBuilder;

    /** Holds teh instance of AuthService class of type AuthService @private */
    private router: Router;

    // creates instance of login component
    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.authService = this.injector.get(AuthenticationService);
        this.formBuilder = this.injector.get(FormBuilder);
        this.router = this.injector.get(Router);
        this.sharedService = this.injector.get(SharedService);
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
        this.returnUrl = isNullOrUndefined(sessionStorage.getItem('returnUrl')) ? '/' : sessionStorage.getItem('returnUrl');
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
                }
                sessionStorage.removeItem('returnUrl');
            }, (err: HttpErrorResponse): void => {
                this.isLoadingResults = false;
                this.restService.handleError(err, 'post');
            });
    }
}
