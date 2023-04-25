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
 * @file PagePerRow Model
 */
import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PAGERSMARTTABLE } from 'CommonModel';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes PagePerRow.html as template url
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'page-per-row',
  templateUrl: './PagePerRow.html',
  styleUrls: ['./PagePerRow.scss']
})
/** Exporting a class @exports PagePerRow */
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class PagePerRow {
  /** To inject services @public */
  public injector: Injector;

  /** handle translate @public */
  public translateService: TranslateService;

  /** get the pagaintion default select value @public */
  public getDefaultSelected: number;

  /** Controls the pagination List Count form @public */
  public pageCount: { value: number; viewValue: number; }[] =
    [
      { value: 10, viewValue: 10 },
      { value: 25, viewValue: 25 },
      { value: 50, viewValue: 50 },
      { value: 100, viewValue: 100 }
    ];

  /** Contains all methods related to shared @private */
  public sharedService: SharedService;

  /** Event emitter to emit selected page number @public */
  @Output() public pagePerRow: EventEmitter<number> = new EventEmitter();

  constructor(injector: Injector) {
    this.injector = injector;
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    const getPaginationValues: PAGERSMARTTABLE = this.sharedService.paginationPagerConfig();
    this.getDefaultSelected = getPaginationValues.perPage;
  }

  /** Handles select event @public */
  public onSelectRow(e: number): void {
    this.pagePerRow.emit(e);
  }
}
