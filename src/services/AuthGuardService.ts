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
 * @file Auth gaurd
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from 'AuthenticationService';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable()
export class AuthGuardService implements CanActivate {
    /** Holds teh instance of AuthService class of type AuthService @private */
    private router: Router;
    /** Holds teh instance of Router class of type Router @private */
    private authService: AuthenticationService;

    constructor(router: Router, authService: AuthenticationService) {
        this.router = router;
        this.authService = authService;
    }

    /**
     * Returns Observable<boolean> if authorized @public
     */
    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        // eslint-disable-next-line deprecation/deprecation
        return combineLatest(
            this.authService.isLoggedIn,
            this.authService.isChangePassword
        ).pipe(
            map(([isLoggedIn, changePassword]: [boolean, boolean]): boolean => {
                if (changePassword || isLoggedIn) {
                    return true;
                } else {
                    this.router.navigate(['/login']).catch((): void => {
                        // Catch Navigation Error
                    });
                    this.authService.destoryToken();
                    return false;
                }
            })
        );
    }
}
