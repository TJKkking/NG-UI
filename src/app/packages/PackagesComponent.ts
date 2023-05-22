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
 * @file Packages-Component.ts.
 */
import { Component, Injector } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
/**
 * Creating Component
 * @Component takes PackagesComponent.html as template url
 */
@Component({
    selector: 'app-packages',
    templateUrl: './PackagesComponent.html',
    styleUrls: ['./PackagesComponent.scss']
})
/** Exporting a class @exports PackagesComponent */
export class PackagesComponent{
    /** Invoke service injectors @public */
    public injector: Injector;

    /** Holds teh instance of AuthService class of type AuthService @private */
    private router: Router;

    // creates packages component
    constructor(injector: Injector) {
        this.injector = injector;
        this.router = this.injector.get(Router);
        this.router.events.subscribe((event: RouterEvent) => {
            this.redirectToList(event.url);
        });
    }

    /** Return to list NS Package List */
    public redirectToList(getURL: string): void {
        if (getURL === '/packages') {
            this.router.navigate(['/packages/ns']).catch((): void => {
                // Catch Navigation Error
            });
        }
    }
}
