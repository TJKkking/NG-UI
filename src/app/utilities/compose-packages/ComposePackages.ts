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
 * @file Info Compose Package Model
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, URLPARAMS } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
import * as pako from 'pako';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';

/** This is added globally by the tar.js library */
// tslint:disable-next-line: no-any
declare const Tar: any;

/**
 * Creating component
 * @Component takes ComposePackages.html as template url
 */
@Component({
  templateUrl: './ComposePackages.html',
  styleUrls: ['./ComposePackages.scss']
})
/** Exporting a class @exports ComposePackages */
export class ComposePackages implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;

  /** dataService to pass the data from one component to another @public */
  public dataService: DataService;

  /** Varaibles to hold http client @public */
  public httpClient: HttpClient;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** FormGroup instance added to the form @ html @public */
  public packagesForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** To handle loader status for API call @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Create URL holds the end point of any packages @private */
  private createURL: string;

  /** Input contains component objects @private */
  @Input() private params: URLPARAMS;

  /** Holds the end point @private */
  private endPoint: string;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private router: Router;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.dataService = this.injector.get(DataService);
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.notifierService = this.injector.get(NotifierService);
    this.formBuilder = this.injector.get(FormBuilder);
    this.router = this.injector.get(Router);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.packagesForm.controls; }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/gzip',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    this.initializeForm();
  }

  /** initialize Forms @public */
  public initializeForm(): void {
    this.packagesForm = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
  }

  /** Create packages @public */
  public createPackages(): void {
    this.submitted = true;
    this.sharedService.cleanForm(this.packagesForm);
    if (!this.packagesForm.invalid) {
      this.isLoadingResults = true;
      if (this.params.page === 'ns-package') {
        this.endPoint = environment.NSDESCRIPTORSCONTENT_URL;
      } else if (this.params.page === 'vnf-package') {
        this.endPoint = environment.VNFPACKAGESCONTENT_URL;
      }
      const descriptor: string = this.packageYaml(this.params.page);
      try {
        // tslint:disable-next-line: no-any
        const tar: any = new Tar();
        const out: Uint8Array = tar.append(this.packagesForm.value.name + '/' + this.packagesForm.value.name + '.yaml',
          descriptor, { type: '0' });
        const gzipContent: Uint8Array = pako.gzip(out);
        this.createPackageApi(gzipContent.buffer);
      } catch (e) {
        this.isLoadingResults = false;
        this.notifierService.notify('error', this.translateService.instant('ERROR'));
      }
    }
  }
  /** Create packages @public */
  private createPackageApi(packageContent: ArrayBuffer | SharedArrayBuffer): void {
    const apiURLHeader: APIURLHEADER = {
      url: this.endPoint,
      httpOptions: { headers: this.headers }
    };
    // tslint:disable-next-line: completed-docs
    this.restService.postResource(apiURLHeader, packageContent).subscribe((result: { id: string }): void => {
      this.isLoadingResults = false;
      this.activeModal.close();
      this.composeNSPackages(result.id);
    }, (error: ERRORDATA): void => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'post');
    });
  }
  /** Compose NS Packages @private */
  private composeNSPackages(id: string): void {
    let packageUrl: string;
    if (this.params.page === 'ns-package') {
      packageUrl = '/packages/ns/compose/';
      this.notifierService.notify('success', this.packagesForm.value.name + ' ' +
        this.translateService.instant('PAGE.NSPACKAGE.CREATEDSUCCESSFULLY'));
    } else if (this.params.page === 'vnf-package') {
      packageUrl = '/packages/vnf/compose/';
      this.notifierService.notify('success', this.packagesForm.value.name + ' ' +
        this.translateService.instant('PAGE.VNFPACKAGE.CREATEDSUCCESSFULLY'));
    }
    this.router.navigate([packageUrl, id]).catch((): void => {
      // Catch Navigation Error
    });
  }
  /** Deafult template for NS and VNF Packages @private */
  private packageYaml(descriptorType: string): string {
    let packageYaml: {} = {};
    const composerName: string = 'NGUI Composer';
    const composerDefaultVersion: string = '1.0';
    if (descriptorType === 'ns-package') {
      packageYaml = {
        nsd: {
          nsd: [
            {
              id: this.packagesForm.value.name,
              name: this.packagesForm.value.name,
              version: composerDefaultVersion,
              description: this.packagesForm.value.name + ' descriptor',
              designer: composerName,
              df: [
                {
                  id: 'default-df',
                  'vnf-profile': []
                }
              ]
            }
          ]
        }
      };
    } else {
      packageYaml = {
        vnfd: {
          id: this.packagesForm.value.name,
          'product-name': this.packagesForm.value.name,
          version: composerDefaultVersion,
          description: this.packagesForm.value.name + ' descriptor',
          provider: composerName,
          df: [
            {
              id: 'default-df',
              'instantiation-level': [],
              'vdu-profile': []
            }
          ],
          'ext-cpd': [],
          vdu: [],
          'sw-image-desc': [],
          'virtual-storage-desc': []
        }
      };
    }
    return jsyaml.dump(packageYaml);
  }
}
