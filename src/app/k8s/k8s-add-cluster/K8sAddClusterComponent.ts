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
 * @file K8sAddClusterComponent.ts.
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { VimAccountDetails } from 'VimAccountModel';
/**
 * Creating Component
 * @Component takes K8sAddClusterComponent.html as template url
 */
@Component({
  selector: 'app-k8s-add-cluster',
  templateUrl: './K8sAddClusterComponent.html',
  styleUrls: ['./K8sAddClusterComponent.scss']
})
/** Exporting a class @exports K8sAddClusterComponent */
export class K8sAddClusterComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** FormGroup instance added to the form @ html @public */
  public k8sclusterForm: FormGroup;

  /** Contains all vim account collections */
  public vimAccountSelect: VimAccountDetails;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Variable set for twoway bindng @public  */
  public vimAccountId: string;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Check the loading results @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Element ref for fileInputNets @public */
  @ViewChild('fileInputNets', { static: true }) public fileInputNets: ElementRef;

  /** Element ref for fileInputNetsLabel @public */
  @ViewChild('fileInputNetsLabel', { static: true }) public fileInputNetsLabel: ElementRef;

  /** Element ref for fileInputCredentials @public */
  @ViewChild('fileInputCredentials', { static: true }) public fileInputCredentials: ElementRef;

  /** Element ref for fileInputCredentialsLabel @public */
  @ViewChild('fileInputCredentialsLabel', { static: true }) public fileInputCredentialsLabel: ElementRef;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Utilizes rest service for any CRUD operations @private */
  private restService: RestService;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.formBuilder = this.injector.get(FormBuilder);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  public ngOnInit(): void {
    /** On Initializing call the methods */
    this.k8sclusterFormAction();
    this.getDetailsvimAccount();
    this.headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
  }

  /** On modal initializing forms  @public */
  public k8sclusterFormAction(): void {
    this.k8sclusterForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      k8s_version: ['', [Validators.required]],
      vim_account: [null, [Validators.required]],
      description: ['', [Validators.required]],
      nets: ['', [Validators.required]],
      credentials: ['', [Validators.required]]
    });
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.k8sclusterForm.controls; }

  /** Call the vimAccount details in the selection options @public */
  public getDetailsvimAccount(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.VIMACCOUNTS_URL).subscribe((vimAccounts: VimAccountDetails) => {
      this.vimAccountSelect = vimAccounts;
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }

  /** On modal submit k8sAddClusterSubmit will called @public */
  public k8sAddClusterSubmit(): void {
    this.submitted = true;
    this.sharedService.cleanForm(this.k8sclusterForm);
    if (this.k8sclusterForm.invalid) {
      return;
    }
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    const apiURLHeader: APIURLHEADER = {
      url: environment.K8SCLUSTER_URL,
      httpOptions: { headers: this.headers }
    };
    const validJSONCredentails: boolean = this.sharedService.checkJson(this.k8sclusterForm.value.credentials);
    if (validJSONCredentails) {
      this.k8sclusterForm.value.credentials = jsyaml.load(this.k8sclusterForm.value.credentials.toString(), { json: true });
    } else {
      this.notifierService.notify('error', this.translateService.instant('INVALIDCONFIG'));
      return;
    }
    const validJSONNets: boolean = this.sharedService.checkJson(this.k8sclusterForm.value.nets);
    if (validJSONNets) {
      this.k8sclusterForm.value.nets = jsyaml.load(this.k8sclusterForm.value.nets.toString(), { json: true });
    } else {
      this.notifierService.notify('error', this.translateService.instant('INVALIDCONFIG'));
      return;
    }
    this.isLoadingResults = true;
    this.restService.postResource(apiURLHeader, this.k8sclusterForm.value).subscribe((result: {}) => {
      this.activeModal.close(modalData);
      this.isLoadingResults = false;
      this.notifierService.notify('success', this.k8sclusterForm.value.name +
        this.translateService.instant('PAGE.K8S.CREATEDSUCCESSFULLY'));
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'post');
      this.isLoadingResults = false;
    });
  }

  /** Nets file process @private */
  public netsFile(files: FileList): void {
    if (files && files.length === 1) {
      this.sharedService.getFileString(files, 'json').then((fileContent: string): void => {
        const getNetsJson: string = jsyaml.load(fileContent, { json: true });
        // tslint:disable-next-line: no-backbone-get-set-outside-model
        this.k8sclusterForm.get('nets').setValue(JSON.stringify(getNetsJson));
      }).catch((err: string): void => {
        if (err === 'typeError') {
          this.notifierService.notify('error', this.translateService.instant('JSONFILETYPEERRROR'));
        } else {
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        }
        this.fileInputNetsLabel.nativeElement.innerText = this.translateService.instant('CHOOSEFILE');
        this.fileInputNets.nativeElement.value = null;
      });
    } else if (files && files.length > 1) {
      this.notifierService.notify('error', this.translateService.instant('DROPFILESVALIDATION'));
    }
    this.fileInputNetsLabel.nativeElement.innerText = files[0].name;
    this.fileInputNets.nativeElement.value = null;
  }

  /** credentials file process @private */
  public credentialsFile(files: FileList): void {
    if (files && files.length === 1) {
      this.sharedService.getFileString(files, 'yaml').then((fileContent: string): void => {
        const getCredentialsJson: string = jsyaml.load(fileContent, { json: true });
        // tslint:disable-next-line: no-backbone-get-set-outside-model
        this.k8sclusterForm.get('credentials').setValue(JSON.stringify(getCredentialsJson));
      }).catch((err: string): void => {
        if (err === 'typeError') {
          this.notifierService.notify('error', this.translateService.instant('YAMLFILETYPEERRROR'));
        } else {
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        }
        this.fileInputCredentialsLabel.nativeElement.innerText = this.translateService.instant('CHOOSEFILE');
        this.fileInputCredentials.nativeElement.value = null;
      });
    } else if (files && files.length > 1) {
      this.notifierService.notify('error', this.translateService.instant('DROPFILESVALIDATION'));
    }
    this.fileInputCredentialsLabel.nativeElement.innerText = files[0].name;
    this.fileInputCredentials.nativeElement.value = null;
  }

}
