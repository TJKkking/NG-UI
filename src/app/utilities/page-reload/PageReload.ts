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
 * @file Page Reload Component
 */
import { Component, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'SharedService';
/**
 * Creating component
 * @Component takes PageReload.html as template url
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'page-reload',
  templateUrl: './PageReload.html',
  styleUrls: ['./PageReload.scss']
})
/** Exporting a class @exports PageReload */
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class PageReload {
  /** To inject services @public */
  public injector: Injector;

  /** handle translate @public */
  public translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    // Empty Block
  }

  /** Handles select event @public */
  public reloadPage(): void {
    this.sharedService.dataEvent.emit();
  }
}
