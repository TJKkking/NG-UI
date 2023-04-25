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
 * @file Page for Operational View App actions Component
 */
import { isNullOrUndefined } from 'util';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { URLPARAMS } from 'CommonModel';
/**
 * Creating component
 * @Component takes OperationalViewAppActionsComponent.html as template url
 */
@Component({
  selector: 'app-operational-view-app-actions',
  templateUrl: './OperationalViewAppActionsComponent.html'
})
/** Exporting a class @exports OperationalViewAppActionsComponent */
export class OperationalViewAppActionsComponent implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;

  /** Get the actions data @public */
  public actionsData: {}[];

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Input contains component objects @private */
  @Input() private params: URLPARAMS;

  /** creates Operational view app actions component */
  constructor(injector: Injector) {
    this.injector = injector;
    this.activeModal = this.injector.get(NgbActiveModal);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.actionsData = [];
    if (!isNullOrUndefined(this.params.actions)) {
      this.actionsData = Object.keys(this.params.actions).map((key: string): Object => (
        {
          actions: key,
          // eslint-disable-next-line security/detect-object-injection
          description: this.params.actions[key]
        }));
    }
  }
}
