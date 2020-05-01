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
 * @file SDN Controller Component.
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, SDN_TYPES, TYPESECTION } from 'CommonModel';
import { environment } from 'environment';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes NewSDNControllerComponent.html as template url
 */
@Component({
  templateUrl: './NewSDNControllerComponent.html',
  styleUrls: ['./NewSDNControllerComponent.scss']
})
/** Exporting a class @exports NewSDNControllerComponent */
export class NewSDNControllerComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Set SDN Type select to empty @public */
  public sdnTypeMod: string = null;

  /** Setting SDN types in array @public */
  public sdnType: TYPESECTION[];

  /** New SDN controller form controls using formgroup @public */
  public sdnControllerForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.formBuilder = this.injector.get(FormBuilder);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.sharedService = this.injector.get(SharedService);

    /** Initializing Form Action */
    this.sdnControllerForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.required],
      ip: ['', Validators.pattern(this.sharedService.REGX_IP_PATTERN)],
      port: ['', Validators.pattern(this.sharedService.REGX_PORT_PATTERN)],
      dpid: ['', Validators.pattern(this.sharedService.REGX_DPID_PATTERN)],
      version: ['']
    });
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.sdnControllerForm.controls; }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.sdnType = SDN_TYPES;
    this.headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
  }

  /** On modal submit sdnControllerFormSubmit will called @public */
  public sdnControllerFormSubmit(): void {
    this.submitted = true;
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    this.sharedService.cleanForm(this.sdnControllerForm);
    if (!this.sdnControllerForm.invalid) {
      this.isLoadingResults = true;
      const apiURLHeader: APIURLHEADER = {
        url: environment.SDNCONTROLLER_URL,
        httpOptions: { headers: this.headers }
      };
      if (this.sdnControllerForm.value.port) {
        this.sdnControllerForm.value.port = +this.sdnControllerForm.value.port;
      }
      if (this.sdnControllerForm.value.version === '') {
        this.sdnControllerForm.value.version = undefined;
      }
      this.restService.postResource(apiURLHeader, this.sdnControllerForm.value)
        .subscribe((result: {}) => {
          this.activeModal.close(modalData);
          this.isLoadingResults = false;
          this.notifierService.notify('success', this.translateService.instant('PAGE.SDNCONTROLLER.CREATEDSUCCESSFULLY'));
        }, (error: ERRORDATA) => {
          this.restService.handleError(error, 'post');
          this.isLoadingResults = false;
        });
    }
  }
}
