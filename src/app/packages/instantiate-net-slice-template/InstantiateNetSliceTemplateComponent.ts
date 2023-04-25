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
 * @file Instantiate NS Modal Component.
 */
import { isNullOrUndefined } from 'util';
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
import { NetworkSliceData } from 'NetworkSliceModel';
import { NSICREATEPARAMS } from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { VimAccountDetails } from 'VimAccountModel';
/**
 * Creating component
 * @Component takes InstantiateNetSliceTemplateComponent.html as template url
 */
@Component({
  selector: 'app-instantiate-net-slice-template',
  templateUrl: './InstantiateNetSliceTemplateComponent.html',
  styleUrls: ['./InstantiateNetSliceTemplateComponent.scss']
})
/** Exporting a class @exports InstantiateNetSliceTemplateComponent */
export class InstantiateNetSliceTemplateComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** FormGroup instance added to the form @ html @public */
  public netSliceInstantiateForm: FormGroup;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Variable set for twoway bindng @public  */
  public vimAccountId: string;

  /** Contains all the net slice data collections */
  public netSliceSelect: NetworkSliceData;

  /** Contains all the VIM data collections */
  public vimDetailsSelect: VimAccountDetails;

  /** Variable set for twoway binding @public */
  public netsliceNstId: string;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Element ref for fileInputConfig @public */
  @ViewChild('fileInputConfig', { static: true }) public fileInputConfig: ElementRef;

  /** Element ref for fileInputConfigLabel @public */
  @ViewChild('fileInputConfigLabel', { static: true }) public fileInputConfigLabel: ElementRef;

  /** Element ref for fileInputSSH @public */
  @ViewChild('fileInputSSH', { static: true }) public fileInputSSH: ElementRef;

  /** Element ref for fileInputSSHLabel @public */
  @ViewChild('fileInputSSHLabel', { static: true }) public fileInputSSHLabel: ElementRef;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private router: Router;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Utilizes rest service for any CRUD operations @private */
  private restService: RestService;

  /** Utilizes data service for any communication @private */
  private dataService: DataService;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Contains the ssh key to be hosted in dom @private */
  private copySSHKey: string;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.formBuilder = this.injector.get(FormBuilder);
    this.dataService = this.injector.get(DataService);
    this.notifierService = this.injector.get(NotifierService);
    this.router = this.injector.get(Router);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    /** Setting up initial value for NSD */
    this.netsliceNstId = '';
    this.dataService.currentMessage.subscribe((event: NetworkSliceData) => {
      if (event.identifier !== undefined || event.identifier !== '' || event.identifier !== null) {
        this.netsliceNstId = event.identifier;
      }
    });
    this.netSliceInstantiateFormAction();
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    /** On Initializing call the methods */
    this.getNetSliceDetails();
    this.getVIMDetails();
  }

  /** Call the netSlice details in the selection options @public */
  public getNetSliceDetails(): void {
    this.restService.getResource(environment.NETWORKSLICETEMPLATECONTENT_URL).subscribe((netSlicePackages: NetworkSliceData) => {
      this.netSliceSelect = netSlicePackages;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
    });
  }

  /** Call the VIM details in the selection options @public */
  public getVIMDetails(): void {
    this.restService.getResource(environment.VIMACCOUNTS_URL).subscribe((vimDetails: VimAccountDetails) => {
      this.vimDetailsSelect = vimDetails;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
    });
  }

  /** On modal initializing forms  @public */
  public netSliceInstantiateFormAction(): void {
    this.netSliceInstantiateForm = this.formBuilder.group({
      nsiName: ['', [Validators.required]],
      nsiDescription: ['', [Validators.required]],
      nstId: ['', [Validators.required]],
      vimAccountId: ['', [Validators.required]],
      ssh_keys: [null],
      config: [null]
    });
  }
  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.netSliceInstantiateForm.controls; }

  /** On modal submit instantiateNsSubmit will called @public */
  public instantiateNSTSubmit(): void {
    this.submitted = true;
    this.sharedService.cleanForm(this.netSliceInstantiateForm);
    if (this.netSliceInstantiateForm.invalid) {
      return;
    }
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    if (isNullOrUndefined(this.netSliceInstantiateForm.value.ssh_keys) || this.netSliceInstantiateForm.value.ssh_keys === '') {
      delete this.netSliceInstantiateForm.value.ssh_keys;
    } else {
      this.copySSHKey = JSON.parse(JSON.stringify(this.netSliceInstantiateForm.value.ssh_keys));
      this.netSliceInstantiateForm.get('ssh_keys').setValue(this.copySSHKey);
    }
    if (isNullOrUndefined(this.netSliceInstantiateForm.value.config) || this.netSliceInstantiateForm.value.config === '') {
      delete this.netSliceInstantiateForm.value.config;
    } else {
      const validJSON: boolean = this.sharedService.checkJson(this.netSliceInstantiateForm.value.config);
      if (validJSON) {
        this.netSliceInstantiateForm.value.config = JSON.parse(this.netSliceInstantiateForm.value.config);
        Object.keys(this.netSliceInstantiateForm.value.config).forEach((item: string) => {
          // eslint-disable-next-line security/detect-object-injection
          this.netSliceInstantiateForm.value[item] = this.netSliceInstantiateForm.value.config[item];
        });
        delete this.netSliceInstantiateForm.value.config;
      } else {
        const getConfigJson: string = jsyaml.load(this.netSliceInstantiateForm.value.config, { json: true });
        Object.keys(getConfigJson).forEach((item: string) => {
          // eslint-disable-next-line security/detect-object-injection
          this.netSliceInstantiateForm.value[item] = getConfigJson[item];
        });
        delete this.netSliceInstantiateForm.value.config;
      }
    }
    this.isLoadingResults = true;
    const apiURLHeader: APIURLHEADER = {
      url: environment.NETWORKSLICEINSTANCESCONTENT_URL,
      httpOptions: { headers: this.headers }
    };
    this.restService.postResource(apiURLHeader, this.netSliceInstantiateForm.value)
      .subscribe((result: {}) => {
        this.activeModal.close(modalData);
        this.isLoadingResults = false;
        this.notifierService.notify('success', this.netSliceInstantiateForm.value.nsiName +
          this.translateService.instant('PAGE.NETSLICE.CREATEDSUCCESSFULLY'));
        this.router.navigate(['/instances/netslice']).catch((): void => {
          // Catch Navigation Error
      });
      }, (error: ERRORDATA) => {
        this.restService.handleError(error, 'post');
        if (!isNullOrUndefined(this.copySSHKey)) {
          this.netSliceInstantiateForm.get('ssh_keys').setValue(this.copySSHKey);
        }
        this.isLoadingResults = false;
      });
  }

  /** ssh file process @private */
  public sshFile(files: FileList): void {
    if (files && files.length === 1) {
      this.sharedService.getFileString(files, 'pub').then((fileContent: string): void => {
        const getSSHJson: string = jsyaml.load(fileContent, { json: true });
        this.netSliceInstantiateForm.get('ssh_keys').setValue(getSSHJson);
      }).catch((err: string): void => {
        if (err === 'typeError') {
          this.notifierService.notify('error', this.translateService.instant('PUBFILETYPEERRROR'));
        } else {
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        }
        this.fileInputSSHLabel.nativeElement.innerText = this.translateService.instant('CHOOSEFILE');
        this.fileInputSSH.nativeElement.value = null;
      });
    } else if (files && files.length > 1) {
      this.notifierService.notify('error', this.translateService.instant('DROPFILESVALIDATION'));
    }
    this.fileInputSSHLabel.nativeElement.innerText = files[0].name;
    this.fileInputSSH.nativeElement.value = null;
  }

  /** Config file process @private */
  public configFile(files: FileList): void {
    if (files && files.length === 1) {
      const fileFormat: string = this.sharedService.fetchFileExtension(files).toLocaleLowerCase();
      if (fileFormat === 'yaml' || fileFormat === 'yml') {
        this.sharedService.getFileString(files, 'yaml').then((fileContent: string): void => {
          const getConfigJson: string = jsyaml.load(fileContent, { json: true });
          this.netSliceInstantiateForm.get('config').setValue(JSON.stringify(getConfigJson));
        }).catch((err: string): void => {
          if (err === 'typeError') {
            this.notifierService.notify('error', this.translateService.instant('YAMLFILETYPEERRROR'));
          } else {
            this.notifierService.notify('error', this.translateService.instant('ERROR'));
          }
          this.fileInputConfigLabel.nativeElement.innerText = this.translateService.instant('CHOOSEFILE');
          this.fileInputConfig.nativeElement.value = null;
        });
      } else if (fileFormat === 'json') {
        this.sharedService.getFileString(files, 'json').then((fileContent: string): void => {
          const getConfigJson: string = jsyaml.load(fileContent, { json: true });
          this.netSliceInstantiateForm.get('config').setValue(JSON.stringify(getConfigJson));
        }).catch((err: string): void => {
          if (err === 'typeError') {
            this.notifierService.notify('error', this.translateService.instant('JSONFILETYPEERRROR'));
          } else {
            this.notifierService.notify('error', this.translateService.instant('ERROR'));
          }
          this.fileInputConfigLabel.nativeElement.innerText = this.translateService.instant('CHOOSEFILE');
          this.fileInputConfig.nativeElement.value = null;
        });
      }
    } else if (files && files.length > 1) {
      this.notifierService.notify('error', this.translateService.instant('DROPFILESVALIDATION'));
    }
    this.fileInputConfigLabel.nativeElement.innerText = files[0].name;
    this.fileInputConfig.nativeElement.value = null;
  }
}
