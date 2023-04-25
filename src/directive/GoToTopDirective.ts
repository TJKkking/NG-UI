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
 * @file Directive for go to top button.
 */
import { Directive, HostListener } from '@angular/core';
import { SharedService } from 'SharedService';

/**
 * Creating Directive for handling go to top button
 * @Directive appGottoTop selector
 */
@Directive({
  selector: '[appGottoTop]'
})
/** Exporting a class @exports GoToTopDirective */
export class GoToTopDirective {
  /** To set scroll top position @private */
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  private topPosToStartShowing: number = 100;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(sharedService: SharedService) {
    this.sharedService = sharedService;
  }
  /**
   * to listen the scroll event in DOM @public
   */
  @HostListener('window:scroll') public enableGotoTop(): void {
    // eslint-disable-next-line deprecation/deprecation
    const scrollPosition: number = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
    if (scrollPosition >= this.topPosToStartShowing) {
      this.sharedService.showGotoTop = true;
    } else {
      this.sharedService.showGotoTop = false;
    }
  }
}
