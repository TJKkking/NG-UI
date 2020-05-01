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
 * @file WIM Account Component.
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, TYPESECTION, WIM_TYPES } from 'CommonModel';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';

/**
 * Creating component
 * @Component takes NewWIMAccountComponent.html as template url
 */
@Component({
  templateUrl: './NewWIMAccountComponent.html',
  styleUrls: ['./NewWIMAccountComponent.scss']
})
/** Exporting a class @exports NewWIMAccountComponent */
export class NewWIMAccountComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Setting wim types in array @public */
  public wimType: TYPESECTION[];

  /** Set WIM Type select to empty @public */
  public wimTypeMod: string = null;

  /** New WIM account form controls using formgroup @public */
  public wimNewAccountForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Element ref for fileInputConfig @public */
  @ViewChild('fileInputConfig', { static: true }) public fileInputConfig: ElementRef;

  /** Element ref for fileInputConfig @public */
  @ViewChild('fileInputConfigLabel', { static: true }) public fileInputConfigLabel: ElementRef;

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
    this.wimNewAccountForm = this.formBuilder.group({
      name: ['', Validators.required],
      wim_type: ['', Validators.required],
      wim_url: ['', [Validators.required, Validators.pattern(this.sharedService.REGX_URL_PATTERN)]],
      user: ['', Validators.required],
      password: ['', Validators.required],
      description: [null],
      config: [null]
    });
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.wimNewAccountForm.controls; }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.wimType = WIM_TYPES;
    this.headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
  }

  /** On modal submit newWimAccountSubmit will called @public */
  public newWimAccountSubmit(): void {
    this.submitted = true;
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    this.sharedService.cleanForm(this.wimNewAccountForm);
    if (this.wimNewAccountForm.value.description === '') {
      this.wimNewAccountForm.value.description = null;
    }
    if (isNullOrUndefined(this.wimNewAccountForm.value.config) || this.wimNewAccountForm.value.config === '') {
      delete this.wimNewAccountForm.value.config;
    } else {
      const validJSON: boolean = this.sharedService.checkJson(this.wimNewAccountForm.value.config);
      if (validJSON) {
        this.wimNewAccountForm.value.config = JSON.parse(this.wimNewAccountForm.value.config);
      } else {
        this.notifierService.notify('error', this.translateService.instant('INVALIDCONFIG'));
        return;
      }
    }
    if (!this.wimNewAccountForm.invalid) {
      this.isLoadingResults = true;
      const apiURLHeader: APIURLHEADER = {
        url: environment.WIMACCOUNTS_URL,
        httpOptions: { headers: this.headers }
      };
      this.restService.postResource(apiURLHeader, this.wimNewAccountForm.value)
        .subscribe((result: {}) => {
          this.activeModal.close(modalData);
          this.isLoadingResults = false;
          this.notifierService.notify('success', this.translateService.instant('PAGE.WIMACCOUNTS.CREATEDSUCCESSFULLY'));
        }, (error: ERRORDATA) => {
          this.restService.handleError(error, 'post');
          this.isLoadingResults = false;
        });
    }
  }

  /** Config file process @private */
  public configFile(files: FileList): void {
    if (files && files.length === 1) {
      this.sharedService.getFileString(files, 'yaml').then((fileContent: string): void => {
        const getConfigJson: string = jsyaml.load(fileContent, { json: true });
        // tslint:disable-next-line: no-backbone-get-set-outside-model
        this.wimNewAccountForm.get('config').setValue(JSON.stringify(getConfigJson));
      }).catch((err: string): void => {
        if (err === 'typeError') {
          this.notifierService.notify('error', this.translateService.instant('YAMLFILETYPEERRROR'));
        } else {
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        }
        this.fileInputConfigLabel.nativeElement.innerText = this.translateService.instant('CHOOSEFILE');
        this.fileInputConfig.nativeElement.value = null;
      });
    } else if (files && files.length > 1) {
      this.notifierService.notify('error', this.translateService.instant('DROPFILESVALIDATION'));
    }
    this.fileInputConfigLabel.nativeElement.innerText = files[0].name;
    this.fileInputConfig.nativeElement.value = null;
  }
}
