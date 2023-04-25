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
 * @file Roles component.
 */
import { Component, Injector } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';

/**
 * Creating component
 * @Component takes RolesComponent.html as template url
 */
@Component({
  selector: 'app-roles',
  templateUrl: './RolesComponent.html',
  styleUrls: ['./RolesComponent.scss']
})

/** Exporting a class @exports RolesComponent */
export class RolesComponent {
  /** Invoke service injectors @public */
  public injector: Injector;

  /** Holds teh instance of router service @private */
  private router: Router;

  // creates role datails component
  constructor(injector: Injector) {
    this.injector = injector;
    this.router = this.injector.get(Router);
    this.router.events.subscribe((event: RouterEvent) => {
      this.redirectToList(event.url);
    });
  }

  /** Return to role datails list */
  public redirectToList(getURL: string): void {
    if (getURL === '/roles') {
      this.router.navigate(['/roles/details']).catch((): void => {
        // Catch Navigation Error
    });
    }
  }
}
