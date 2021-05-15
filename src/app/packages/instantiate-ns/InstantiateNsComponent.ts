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
import { NSCREATEPARAMS, NSData, NSDDetails } from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { VimAccountDetails } from 'VimAccountModel';

/**
 * Creating component
 * @Component takes InstantiateNsComponent.html as template url
 */
@Component({
  selector: 'app-instantiate-ns',
  templateUrl: './InstantiateNsComponent.html',
  styleUrls: ['./InstantiateNsComponent.scss']
})
/** Exporting a class @exports InstantiateNsComponent */
export class InstantiateNsComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Contains all the nsd data collections */
  public nsdSelect: NSDDetails;

  /** FormGroup instance added to the form @ html @public */
  public instantiateForm: FormGroup;

  /** Contains all vim account collections */
  public vimAccountSelect: VimAccountDetails;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Variable set for twoway binding @public */
  public nsdId: string;

  /** Variable set for twoway bindng @public  */
  public vimAccountId: string;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Check the loading results @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Contains Selected VIM Details @public */
  public selectedVIMDetails: VimAccountDetails = null;

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

  public ngOnInit(): void {
    /** Setting up initial value for NSD */
    this.dataService.currentMessage.subscribe((event: NSData) => {
      if (event.identifier !== undefined || event.identifier !== '' || event.identifier !== null) {
        this.nsdId = event.identifier;
      }
    });
    /** On Initializing call the methods */
    this.instantiateFormAction();
    this.getDetailsnsd();
    this.getDetailsvimAccount();
  }

  /** On modal initializing forms  @public */
  public instantiateFormAction(): void {
    this.instantiateForm = this.formBuilder.group({
      nsName: ['', [Validators.required]],
      nsDescription: ['', [Validators.required]],
      nsdId: ['', [Validators.required]],
      vimAccountId: ['', [Validators.required]],
      ssh_keys: [null],
      config: [null]
    });
  }

  /** Convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.instantiateForm.controls; }

  /** Call the nsd details in the selection options @public */
  public getDetailsnsd(): void {
    this.restService.getResource(environment.NSDESCRIPTORSCONTENT_URL).subscribe((nsPackages: NSDDetails) => {
      this.nsdSelect = nsPackages;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
    });
  }

  /** Call the vimAccount details in the selection options @public */
  public getDetailsvimAccount(): void {
    this.restService.getResource(environment.VIMACCOUNTS_URL).subscribe((vimAccounts: VimAccountDetails) => {
      this.vimAccountSelect = vimAccounts;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
    });
  }

  /** On modal submit instantiateNsSubmit will called @public */
  public instantiateNsSubmit(): void {
    this.submitted = true;
    this.sharedService.cleanForm(this.instantiateForm);
    if (this.instantiateForm.invalid) {
      return;
    }
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    if (isNullOrUndefined(this.instantiateForm.value.ssh_keys) || this.instantiateForm.value.ssh_keys === '') {
      delete this.instantiateForm.value.ssh_keys;
    } else {
      this.copySSHKey = JSON.parse(JSON.stringify(this.instantiateForm.value.ssh_keys));
      // tslint:disable-next-line: no-backbone-get-set-outside-model
      this.instantiateForm.get('ssh_keys').setValue([this.copySSHKey]);
    }
    if (isNullOrUndefined(this.instantiateForm.value.config) || this.instantiateForm.value.config === '') {
      delete this.instantiateForm.value.config;
    } else {
      const validJSON: boolean = this.sharedService.checkJson(this.instantiateForm.value.config);
      if (validJSON) {
        this.instantiateForm.value.config = JSON.parse(this.instantiateForm.value.config);
        Object.keys(this.instantiateForm.value.config).forEach((item: string) => {
          this.instantiateForm.value[item] = this.instantiateForm.value.config[item];
        });
        delete this.instantiateForm.value.config;
      } else {
        const getConfigJson: string = jsyaml.load(this.instantiateForm.value.config, { json: true });
        Object.keys(getConfigJson).forEach((item: string) => {
          this.instantiateForm.value[item] = getConfigJson[item];
        });
        delete this.instantiateForm.value.config;
      }
    }
    const apiURLHeader: APIURLHEADER = {
      url: environment.NSINSTANCESCONTENT_URL
    };
    this.isLoadingResults = true;
    this.restService.postResource(apiURLHeader, this.instantiateForm.value).subscribe((result: {}) => {
      this.activeModal.close(modalData);
      this.notifierService.notify('success', this.instantiateForm.value.nsName +
        this.translateService.instant('PAGE.NSINSTANCE.CREATEDSUCCESSFULLY'));
      this.router.navigate(['/instances/ns']).catch();
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'post');
      if (!isNullOrUndefined(this.copySSHKey)) {
        // tslint:disable-next-line: no-backbone-get-set-outside-model
        this.instantiateForm.get('ssh_keys').setValue(this.copySSHKey);
      }
    });
  }

  /** ssh file process @private */
  public sshFile(files: FileList): void {
    if (files && files.length === 1) {
      this.sharedService.getFileString(files, 'pub').then((fileContent: string): void => {
        const getSSHJson: string = jsyaml.load(fileContent, { json: true });
        // tslint:disable-next-line: no-backbone-get-set-outside-model
        this.instantiateForm.get('ssh_keys').setValue(getSSHJson);
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
          // tslint:disable-next-line: no-backbone-get-set-outside-model
          this.instantiateForm.get('config').setValue(fileContent);
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
          // tslint:disable-next-line: no-backbone-get-set-outside-model
          this.instantiateForm.get('config').setValue(JSON.stringify(getConfigJson));
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

  /** Get Selected VIM details @public */
  public getSelectedVIMDetails(vimDetails: VimAccountDetails): void {
    if (!isNullOrUndefined(vimDetails.resources)) {
      this.selectedVIMDetails = vimDetails;
    }
  }
}
