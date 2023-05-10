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
import { CanLoad, Route } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable()
export class AcessGuardService implements CanLoad {
    /**
     * check if module can be loaded
     */
    public canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
        // Need to get the Role and valid here for authorization
        if (sessionStorage.getItem('role') === 'Admin') {
            return true;
        } else {
            return false;
        }
    }
}
