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
 * @file Page for Operational View App configs Component
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { URLPARAMS } from 'CommonModel';
import { isNullOrUndefined } from 'util';
/**
 * Creating component
 * @Component takes OperationalViewAppConfigsComponent.html as template url
 */
@Component({
  selector: 'app-operational-view-app-configs',
  templateUrl: './OperationalViewAppConfigsComponent.html'
})
/** Exporting a class @exports OperationalViewAppConfigsComponent */
export class OperationalViewAppConfigsComponent implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;

  /** Get the config data @public */
  public configData: {}[];

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Input contains component objects @private */
  @Input() private params: URLPARAMS;

  /** creates Operational view app config component */
  constructor(injector: Injector) {
    this.injector = injector;
    this.activeModal = this.injector.get(NgbActiveModal);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.configData = [];
    if (!isNullOrUndefined(this.params.configs)) {
      this.configData = Object.keys(this.params.configs).map((key: string): Object => (
        {
          name: key,
          default: this.params.configs[key].default,
          description: this.params.configs[key].description,
          source: this.params.configs[key].source,
          type: this.params.configs[key].type,
          value: this.params.configs[key].value
        }));
    }
  }
}
