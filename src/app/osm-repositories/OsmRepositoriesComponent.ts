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
 * @file OsmRepositoriesComponent.ts
 */
import { Component, Injector } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
/**
 * Creating Component
 * @Component takes OsmRepositoriesComponent.html as template url
 */
@Component({
    selector: 'app-osmrepositories',
    templateUrl: './OsmRepositoriesComponent.html',
    styleUrls: ['./OsmRepositoriesComponent.scss']
})
/** Exporting a class @exports OsmRepositoriesComponent */
export class OsmRepositoriesComponent{
    /** Invoke service injectors @public */
  public injector: Injector;

  /** Holds teh instance of router service @private */
  private router: Router;

  /** creates OSM Repo component */
  constructor(injector: Injector) {
    this.injector = injector;
    this.router = this.injector.get(Router);
    this.router.events.subscribe((event: RouterEvent) => {
      this.redirectToList(event.url);
    });
  }

  /** Return to osm Repo Details list */
  public redirectToList(getURL: string): void {
    if (getURL === '/repos') {
      this.router.navigate(['/repos/details']).catch((): void => {
        // Catch Navigation Error
    });
    }
  }
}
