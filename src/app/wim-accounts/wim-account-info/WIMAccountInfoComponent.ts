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
 * @file Info WIM Page
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CONFIGCONSTANT, ERRORDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { WIMAccountModel } from 'WIMAccountModel';

/**
 * Creating component
 * @Component takes WIMAccountInfoComponent.html as template url
 */
@Component({
  templateUrl: './WIMAccountInfoComponent.html',
  styleUrls: ['./WIMAccountInfoComponent.scss']
})
/** Exporting a class @exports WIMAccountInfoComponent */
export class WIMAccountInfoComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Input contains component objects @public */
  @Input() public params: URLPARAMS;

  /** Contains WIM details @public */
  public wimDetails: WIMAccountModel;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = true;

  /** operational State init data @public */
  public operationalStateFirstStep: string = CONFIGCONSTANT.wimOperationalStateFirstStep;

  /** operational State running data @public */
  public operationalStateSecondStep: string = CONFIGCONSTANT.wimOperationalStateStateSecondStep;

  /** operational State failed data @public */
  public operationalStateThirdStep: string = CONFIGCONSTANT.wimOperationalStateThirdStep;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.sharedService = this.injector.get(SharedService);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.generateData();
  }

  /** Generate Data function @public */
  public generateData(): void {
    this.restService.getResource(environment.WIMACCOUNTS_URL + '/' + this.params.id).subscribe((wimDetails: WIMAccountModel) => {
      this.wimDetails = wimDetails;
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }
}
