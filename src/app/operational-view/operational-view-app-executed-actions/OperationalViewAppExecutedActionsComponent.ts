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

 Author: BARATH KUMAR R (barath.r@tataelxsi.co.in)
*/

/**
 * @file Page for Operational View App Executed actions Component
 */
import { isNullOrUndefined } from 'util';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { URLPARAMS } from 'CommonModel';
import { EXECUTEDACTIONS } from 'OperationalModel';
/**
 * Creating component
 * @Component takes OperationalViewAppExecutedActionsComponent.html as template url
 */
@Component({
  selector: 'app-operational-view-executed-app-actions',
  templateUrl: './OperationalViewAppExecutedActionsComponent.html'
})
/** Exporting a class @exports OperationalViewAppExecutedActionsComponent */
export class OperationalViewAppExecutedActionsComponent implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;

  /** Get the Executed actions data @public */
  public executedActionsData: EXECUTEDACTIONS[];

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Is executed action not available @public */
  public isExecutedActionNotAvailable: boolean = false;

  /** Input contains component objects @private */
  @Input() private params: URLPARAMS;

  /** creates Operational view app executed actions component */
  constructor(injector: Injector) {
    this.injector = injector;
    this.activeModal = this.injector.get(NgbActiveModal);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    if (!isNullOrUndefined(this.params.executedActions) && this.params.executedActions.length > 0) {
      this.params.executedActions.sort((a: EXECUTEDACTIONS, b: EXECUTEDACTIONS): number => (+a.id > +b.id ? 1 : +a.id < +b.id ? -1 : 0));
      this.executedActionsData = this.params.executedActions;
    } else {
      this.isExecutedActionNotAvailable = true;
    }
  }
}
